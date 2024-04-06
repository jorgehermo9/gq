use std::fmt::{self, Display, Formatter};

use self::{
    context::{Context, JsonPathEntry},
    error::InternalError,
};
use derive_getters::Getters;
use derive_more::Constructor;
use serde_json::{Map, Value};

mod context;
mod error;

pub use self::context::OwnedJsonPath;
pub use self::error::Error;

#[derive(Debug, Clone, Constructor)]
pub struct AtomicQueryKey<'a>(&'a str);

impl Display for AtomicQueryKey<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        self.0.fmt(f)
    }
}

#[derive(Debug, Clone, Constructor, Getters)]
pub struct QueryKey<'a> {
    keys: Vec<AtomicQueryKey<'a>>,
}

impl Display for QueryKey<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let keys = self
            .keys()
            .iter()
            .map(ToString::to_string)
            .collect::<Vec<String>>()
            .join(".");
        write!(f, "{keys}")
    }
}

impl<'a> QueryKey<'a> {
    pub fn last_key(&self) -> &AtomicQueryKey<'a> {
        self.keys().last().expect("query key cannot be empty")
    }
}

// TODO: make the invalid states irrepresentable, the children could never be None...
// maybe the Query struct should have a children field that is a Vec<ChildrenQuery>, which
// cannot allow to unnamed keys...
// Maybe we should have a RootQuery and a ChildQuery... inside a Query enum...
#[derive(Constructor, Getters, Debug)]
pub struct Query<'a> {
    alias: Option<AtomicQueryKey<'a>>,
    key: Option<QueryKey<'a>>,
    children: Vec<Self>,
}
impl<'a> Query<'a> {
    pub fn unnamed_with_children(children: Vec<Self>) -> Self {
        Self::new(None, None, children)
    }
    pub fn named_empty(query_alias: Option<AtomicQueryKey<'a>>, query_key: QueryKey<'a>) -> Self {
        return Self::named_with_children(query_alias, query_key, Vec::new());
    }
    pub fn named_with_children(
        query_alias: Option<AtomicQueryKey<'a>>,
        query_key: QueryKey<'a>,
        children: Vec<Self>,
    ) -> Self {
        Self::new(query_alias, Some(query_key), children)
    }

    pub fn output_key(&self) -> &AtomicQueryKey {
        self.alias().as_ref().unwrap_or_else(|| {
            self.key()
                .as_ref()
                .expect("query key cannot be empty")
                .last_key()
        })
    }
}

// TODO: do a validation of the final key collision. Aliases would be need so this errors can be resolved.
// For example, this query:
// ```{
//  actor.login
//  payload.pull_request.head.repo.owner.login
//}
//```
// TODO: when the root query has an alias, it should fail
impl Query<'_> {
    pub fn apply(&self, root_json: Value) -> Result<Value, Error> {
        let root_context = Context::new();
        let (new_root_json, root_context) = match (self.key(), root_json) {
            // TODO: maybe this is not the right way to do it...
            (Some(query_key), value) => {
                // let new_root_json = QueryKeyGet::get(&value, query_key, root_context)?;
                let new_root_json = query_key.inspect(&value, &root_context)?;
                let new_context = root_context.push_query_key(query_key);
                (new_root_json, new_context)
            }
            (None, root_json) => (root_json, root_context),
        };

        Ok(self.do_apply(new_root_json, root_context)?)
    }

    fn do_apply<'a>(
        &'a self,
        value: Value,
        context: Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        // TODO: maybe we should make a differece while representing `field1{ }` and `field1`, since in the fist case
        // the intent might be to filter an object... but the way we are representing it now, it is the same as `field1`,
        // which is just using empty children... given the following json `{"field1": 1}` and the query `{field1{}}` we should
        // fail? it is different from `{field1}`?
        if self.children().is_empty() {
            return Ok(value);
        }

        match value {
            Value::Object(object) => self.do_apply_object(object, context),
            Value::Array(array) => Ok(self.do_apply_array(array, context)),
            _ => Err(InternalError::NonIndexableValue(context.path().clone()))?,
        }
    }

    fn do_apply_object<'a>(
        &'a self,
        object: Map<String, Value>,
        context: Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        let mut filtered_object = serde_json::Map::new();
        // TODO: check if this is necessary
        let value = &Value::Object(object);
        for child in self.children() {
            let Some(child_query_key) = child.key() else {
                panic!("children query must have a key");
            };

            let child_value_result = child_query_key.inspect(value, &context);
            let child_context = context.push_query_key(child_query_key);

            let child_value = match (child_value_result, child_context.array_context()) {
                (Ok(value), _) => value,
                (Err(internal_error), None) => return Err(internal_error),
                (Err(internal_error), Some(array_context)) => {
                    let array_error = InternalError::InsideArray(
                        Box::new(internal_error),
                        array_context.path().clone(),
                    );
                    log::warn!("{array_error}");
                    continue;
                }
            };

            let child_filtered_value_result = child.do_apply(child_value, child_context.clone());
            let child_filtered_value =
                match (child_filtered_value_result, child_context.array_context()) {
                    (Ok(value), _) => value,
                    (Err(child_error), None) => return Err(child_error),
                    (Err(child_error), Some(array_context)) => {
                        let array_error = InternalError::InsideArray(
                            Box::new(child_error),
                            array_context.path().clone(),
                        );
                        log::warn!("{array_error}");
                        continue;
                    }
                };
            filtered_object.insert(child.output_key().to_string(), child_filtered_value);
        }
        Ok(Value::Object(filtered_object))
    }

    fn do_apply_array(&self, array: Vec<Value>, context: Context) -> Value {
        let array_context = context.enter_array();
        let filtered_array = array
            .into_iter()
            .enumerate()
            .map(|(index, item)| {
                let item_context = array_context.push_entry(JsonPathEntry::Index(index));
                self.do_apply(item, item_context)
            })
            .flat_map(|result| {
                result
                    .map_err(|error| {
                        let array_error = InternalError::InsideArray(
                            Box::new(error),
                            array_context.path().clone(),
                        );
                        log::warn!("{array_error}");
                    })
                    .ok()
            })
            .filter(|value| match value {
                Value::Object(object) => !object.is_empty(),
                _ => true,
            })
            .collect();
        Value::Array(filtered_array)
    }
}

impl Display for Query<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let formatted = self.pretty_format(2);
        write!(f, "{formatted}")
    }
}

impl Query<'_> {
    // TODO: do a test for this function, so parsing a formatted query, outputs the
    // same original query...
    pub fn pretty_format(&self, indent: usize) -> String {
        let mut result = String::new();

        let sep = if indent == 0 { ' ' } else { '\n' };

        match self.key() {
            Some(_) => self.do_pretty_format(&mut result, indent, 0, sep),
            None => {
                if self.children().is_empty() {
                    return "{}".to_string();
                }
                result.push_str(&format!("{{{sep}"));
                for child in self.children() {
                    child.do_pretty_format(&mut result, indent, 1, sep);
                }
                result.push('}');
            }
        }
        result
    }

    fn do_pretty_format(&self, result: &mut String, indent: usize, level: usize, sep: char) {
        let indentation = " ".repeat(indent * level);

        let Some(query_key) = self.key() else {
            panic!("children query must have a key");
        };

        result.push_str(&format!("{indentation}{query_key}"));
        if let Some(alias) = self.alias() {
            result.push_str(&format!(": {alias}"));
        }

        if !self.children().is_empty() {
            result.push_str(&format!(" {{{sep}"));
            for child in self.children() {
                child.do_pretty_format(result, indent, level + 1, sep);
            }
            result.push_str(&format!("{indentation}}}{sep}"));
        } else {
            result.push(sep);
        }
    }
}

impl<'a> QueryKey<'a> {
    pub fn inspect(
        &self,
        value: &Value,
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        Self::do_inspect(value, &self.keys, context)
    }
    fn do_inspect(
        value: &Value,
        keys: &[AtomicQueryKey<'a>],
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        let Some((AtomicQueryKey(current_key), rest)) = keys.split_first() else {
            // TODO: try to return a reference here and clone in the caller, so this is more flexible for
            // callers that only needs a reference
            return Ok(value.clone());
        };
        let new_context = context.push_entry(JsonPathEntry::Key(current_key));

        match value {
            Value::Object(object) => {
                let current = object
                    .get(*current_key)
                    .ok_or(InternalError::KeyNotFound(new_context.path().clone()))?;
                Self::do_inspect(current, rest, &new_context)
            }
            Value::Array(array) => {
                let array_context = context.enter_array();
                let indexed_array = array
                    .iter()
                    .enumerate()
                    .map(|(index, item)| {
                        let item_context = array_context.push_entry(JsonPathEntry::Index(index));
                        Self::do_inspect(item, keys, &item_context)
                    })
                    .flat_map(|result| {
                        result
                            .map_err(|error| {
                                let array_error = InternalError::InsideArray(
                                    Box::new(error),
                                    array_context.path().clone(),
                                );
                                log::warn!("{array_error}");
                            })
                            .ok()
                    })
                    // A filter here is not needed since the object indexing will fail and not
                    // warn if the key is missing. This case is different from the Query::do_apply_array
                    .collect();
                Ok(Value::Array(indexed_array))
            }
            _ => Err(InternalError::NonIndexableValue(new_context.path().clone())),
        }
    }
}
