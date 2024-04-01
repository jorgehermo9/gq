use std::{
    fmt::{self, Display, Formatter},
    rc::Rc,
};

use derive_getters::Getters;
use derive_more::Constructor;
use serde_json::{Map, Value};
use thiserror::Error;

#[derive(Debug)]
pub struct QueryKey<'a>(&'a str);

// TODO: create a print method for Query, to print the query in the same format
// as it would be parsed, and add tests for it so we can test that the parser
// and the printer are inverses of each other. generate random queries
// with some crate and then parse them and print them and check that the printed
// query is the same as the original query.

// TODO: make the invalid states irrepresentable, the children could never be None...
// maybe the Query struct should have a children field that is a Vec<ChildrenQuery>, which
// cannot allow to unnamed keys...
#[derive(Constructor, Getters, Debug)]
pub struct Query<'a> {
    key: Option<QueryKey<'a>>,
    children: Vec<Self>,
}
impl<'a> Query<'a> {
    pub fn unnamed_with_children(children: Vec<Self>) -> Self {
        Self::new(None, children)
    }
    pub fn named_empty(name: &'a str) -> Self {
        Self::new(Some(QueryKey(name)), Vec::new())
    }
    pub fn named_with_children(name: &'a str, children: Vec<Self>) -> Self {
        Self::new(Some(QueryKey(name)), children)
    }
}

// TODO: move errors into their own module
#[derive(Debug, Error)]
pub enum Error {
    // TODO: 'key' should be in lowercase or capitalized?
    #[error("key '{0}' not found")]
    KeyNotFound(OwnedJsonPath),
    #[error("{0} while filtering inside array '{1}'")]
    InsideArray(Box<Self>, OwnedJsonPath),
    // TODO: display the children keys in errors?
    #[error("tried to index a non-indexable value (neither object nor array) at '{0}'")]
    NonIndexableValue(OwnedJsonPath),
}

//TODO: maybe this is useless, it is only useful for the '?' syntax to convert a borrowed error into an owned error
#[derive(Debug, Error)]
pub enum InternalError<'a> {
    #[error("key '{0}' not found")]
    KeyNotFound(JsonPath<'a>),
    // TODO: Think about the usefulness of this error
    #[error("{0} while filtering inside array '{1}'")]
    InsideArray(Box<Self>, JsonPath<'a>),
    #[error("tried to index a non-indexable value (neither object nor array) at '{0}'")]
    NonIndexableValue(JsonPath<'a>),
}

impl From<InternalError<'_>> for Error {
    fn from(internal_error: InternalError) -> Self {
        match internal_error {
            InternalError::KeyNotFound(path) => Error::KeyNotFound(path.to_owned()),
            InternalError::InsideArray(internal_error, path) => {
                Error::InsideArray(Box::new(Error::from(*internal_error)), path.to_owned())
            }
            InternalError::NonIndexableValue(path) => Error::NonIndexableValue(path.to_owned()),
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub enum JsonPathEntry<'a> {
    Key(&'a str),
    Index(usize),
}

impl<'a> JsonPathEntry<'a> {
    pub fn to_owned(&self) -> OwnedJsonPathEntry {
        match self {
            JsonPathEntry::Key(key) => OwnedJsonPathEntry::Key(key.to_string()),
            JsonPathEntry::Index(index) => OwnedJsonPathEntry::Index(*index),
        }
    }
}

#[derive(Debug, Clone)]
pub enum OwnedJsonPathEntry {
    Key(String),
    Index(usize),
}

#[derive(Debug, Clone)]
pub enum JsonPath<'a> {
    Root,
    Node {
        entry: JsonPathEntry<'a>,
        parent: Rc<JsonPath<'a>>,
    },
}

impl<'a> JsonPath<'a> {
    pub fn push(&self, entry: JsonPathEntry<'a>) -> Self {
        Self::Node {
            entry,
            parent: Rc::new(self.clone()),
        }
    }

    pub fn to_owned(&self) -> OwnedJsonPath {
        let mut path = Vec::new();
        let mut current = self;
        while let JsonPath::Node { entry, parent } = current {
            path.push(entry.to_owned());
            current = parent;
        }
        path.reverse();
        OwnedJsonPath(path)
    }
}

impl Display for JsonPath<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            JsonPath::Root => write!(f, "$"),
            JsonPath::Node { entry, parent } => {
                parent.fmt(f)?;
                match entry {
                    JsonPathEntry::Key(key) => write!(f, ".{key}"),
                    JsonPathEntry::Index(index) => write!(f, "[{index}]"),
                }
            }
        }
    }
}

#[derive(Debug, Clone)]
pub struct OwnedJsonPath(Vec<OwnedJsonPathEntry>);

impl Display for OwnedJsonPath {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        write!(f, "$")?;
        for entry in &self.0 {
            match entry {
                OwnedJsonPathEntry::Key(key) => write!(f, ".{key}")?,
                OwnedJsonPathEntry::Index(index) => write!(f, "[{index}]")?,
            }
        }
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct ArrayContext<'a> {
    path: JsonPath<'a>,
}

#[derive(Debug, Clone)]
pub struct Context<'a> {
    path: JsonPath<'a>,
    array_context: Option<ArrayContext<'a>>,
}

impl<'a> Context<'a> {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn push(&self, entry: JsonPathEntry<'a>) -> Context<'a> {
        Self {
            path: self.path.push(entry),
            ..self.clone()
        }
    }

    pub fn enter_array(&'a self) -> Self {
        Self {
            array_context: Some(ArrayContext {
                path: self.path.clone(),
            }),
            ..self.clone()
        }
    }
}

impl Default for Context<'_> {
    fn default() -> Self {
        Self {
            path: JsonPath::Root,
            array_context: None,
        }
    }
}

impl Query<'_> {
    pub fn apply(&self, root_json: Value) -> Result<Value, Error> {
        let root_context = Context::new();
        let (new_root_json, root_context) = match (self.key(), root_json) {
            // TODO: maybe this is not the right way to do it...
            (Some(QueryKey(key)), Value::Object(mut root_json)) => {
                let new_context = root_context.push(JsonPathEntry::Key(key));
                let new_root_json = root_json
                    .get_mut(*key)
                    .map(Value::take)
                    .ok_or(InternalError::KeyNotFound(new_context.path.clone()))?;

                (new_root_json, new_context)
            }
            (Some(QueryKey(_)), Value::Array(_)) => todo!("array compression"),
            (Some(QueryKey(_)), _) => Err(InternalError::NonIndexableValue(root_context.path))?,
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
            _ => Err(InternalError::NonIndexableValue(context.path))?,
        }
    }

    fn do_apply_object<'a>(
        &'a self,
        object: Map<String, Value>,
        context: Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        let mut filtered_object = serde_json::Map::new();
        for child in self.children() {
            let Some(QueryKey(child_query_key)) = *child.key() else {
                panic!("children query must have a key");
            };
            let child_context = context.push(JsonPathEntry::Key(child_query_key));
            let child_entry_result = object
                .get(child_query_key)
                .ok_or(InternalError::KeyNotFound(child_context.path.clone()))
                .map(|value| (child_query_key.to_string(), value.clone()));

            let (child_key, child_value) = match (child_entry_result, &child_context.array_context)
            {
                (Ok(entry), _) => entry,
                (Err(internal_error), None) => return Err(internal_error),
                (Err(internal_error), Some(array_context)) => {
                    let array_error = InternalError::InsideArray(
                        Box::new(internal_error),
                        array_context.path.clone(),
                    );
                    log::warn!("{array_error}");
                    continue;
                }
            };
            let child_filtered_value_result = child.do_apply(child_value, child_context.clone());
            let child_filtered_value =
                match (child_filtered_value_result, &child_context.array_context) {
                    (Ok(value), _) => value,
                    (Err(child_error), None) => return Err(child_error),
                    (Err(child_error), Some(array_context)) => {
                        let array_error = InternalError::InsideArray(
                            Box::new(child_error),
                            array_context.path.clone(),
                        );
                        log::warn!("{array_error}");
                        continue;
                    }
                };
            filtered_object.insert(child_key, child_filtered_value);
        }
        Ok(Value::Object(filtered_object))
    }

    fn do_apply_array(&self, array: Vec<Value>, context: Context) -> Value {
        let array_context = context.enter_array();
        let filtered_array = array
            .into_iter()
            .enumerate()
            .map(|(index, item)| {
                let item_context = array_context.push(JsonPathEntry::Index(index));
                self.do_apply(item, item_context)
            })
            .flat_map(|result| {
                result
                    .map_err(|error| {
                        let array_error =
                            InternalError::InsideArray(Box::new(error), array_context.path.clone());
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

        let Some(QueryKey(key)) = self.key() else {
            panic!("children query must have a key");
        };

        result.push_str(&format!("{indentation}{key}"));
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
