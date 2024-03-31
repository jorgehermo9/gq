use std::{
    borrow::Borrow,
    fmt::{self, Display, Formatter},
    rc::Rc,
};

use derive_getters::Getters;
use derive_more::Constructor;
use serde_json::{Map, Value};
use thiserror::Error;

#[derive(Debug)]
pub struct QueryKey<'a>(&'a str);

impl Display for QueryKey<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        write!(f, "{0}", self.0)
    }
}

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
    #[error("tried to index a non-indexable value (neither object nor array) '{0}'")]
    NonIndexableValue(OwnedJsonPath),
}

//TODO: maybe this is useless, it is only useful for the '?' syntax to convert a borrowed error into an owned error
#[derive(Debug, Error)]
pub enum InternalError<'a> {
    #[error("key '{0}' not found")]
    KeyNotFound(JsonPath<'a>),
    #[error("{0} while filtering inside array '{1}'")]
    InsideArray(Box<Self>, JsonPath<'a>),
    // TODO: log the children keys in errors?
    #[error("tried to index a non-indexable value (neither object nor array) '{0}'")]
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
        loop {
            match current {
                JsonPath::Root => break,
                JsonPath::Node { entry, parent } => {
                    path.push(entry.to_owned());
                    current = parent;
                }
            }
        }
        path.reverse();
        OwnedJsonPath(path)
    }
}

impl Display for JsonPath<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            JsonPath::Root => Ok(()),
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
    pub fn apply(&self, mut root_json: Value) -> Result<Value, Error> {
        let root_context = Context::new();
        let (root_json, root_context) = match self.key() {
            // TODO: check if json is an object
            Some(QueryKey(key)) => {
                let new_context = root_context.push(JsonPathEntry::Key(key));
                let new_root_json = root_json
                    .get_mut(key)
                    .map(Value::take)
                    .ok_or(InternalError::KeyNotFound(new_context.path.clone()))?;

                (new_root_json, new_context)
            }
            None => (root_json, root_context),
        };

        Ok(self.do_apply(root_json, root_context)?)
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
            // TODO: Maybe the conversion each time to an owned error is too expensive? We should find
            // a way to return a borrowed error, or to always use the owned one but in other way...
            _ => Err(InternalError::NonIndexableValue(context.path))?,
        }
    }

    fn do_apply_object<'a>(
        &'a self,
        mut object: Map<String, Value>,
        context: Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        let mut filtered_object = serde_json::Map::new();
        for child in self.children() {
            let Some(QueryKey(child_query_key)) = *child.key() else {
                panic!("children query must have a key");
            };
            let child_context = context.push(JsonPathEntry::Key(child_query_key));

            let child_entry_result = object
                .remove_entry(child_query_key)
                .ok_or(InternalError::KeyNotFound(child_context.path.clone()));

            let (child_key, child_value) = match (child_entry_result, &child_context.array_context)
            {
                (Ok(entry), _) => entry,
                (Err(internal_error), None) => return Err(internal_error),
                (Err(internal_error), Some(array_context)) => {
                    let array_error = InternalError::InsideArray(
                        Box::new(internal_error),
                        array_context.path.clone(),
                    );
                    // TODO: Check if displaying the borrowed JsonPath is too expensive,
                    // since it will be doing a recursive call to display the whole path
                    log::warn!("{array_error}");
                    continue;
                }
            };
            let child_filtered_value_result = child.do_apply(child_value, child_context.clone());
            let child_filtered_value = match (
                child_filtered_value_result,
                child_context.array_context.clone(),
            ) {
                (Ok(value), _) => value,
                (Err(child_error), None) => return Err(child_error),
                (Err(child_error), Some(array_context)) => {
                    // TODO: this conversion is expensive?
                    let array_error =
                        InternalError::InsideArray(Box::new(child_error), array_context.path);
                    log::warn!("{array_error}");
                    continue;
                }
            };

            // TODO: do not insert empty child objects? and empty child arrays?
            // do as the array
            filtered_object.insert(child_key, child_filtered_value);
        }
        Ok(Value::Object(filtered_object))
    }

    fn do_apply_array(&self, array: Vec<Value>, context: Context) -> Value {
        let array_context = context.enter_array();
        let filtered_array = array
            .into_iter()
            .enumerate()
            .map(|(index, value)| {
                let index_context = array_context.push(JsonPathEntry::Index(index));
                self.do_apply(value, index_context)
            })
            .flat_map(|result| {
                result
                    .map_err(|error| {
                        //TODO: this conversion is expensive?
                        let array_error =
                            InternalError::InsideArray(Box::new(error), array_context.path.clone());
                        log::warn!("{array_error}");
                    })
                    .ok()
            })
            // TODO: just filter empty objects or also empty arrays?
            // TODO: filter empty objects? and what about nested empty arrays?
            .filter(|v| !v.is_empty_object())
            .collect::<Vec<Value>>();
        Value::Array(filtered_array)
    }
}

trait IsEmptyObject {
    fn is_empty_object(&self) -> bool;
}

impl IsEmptyObject for Value {
    fn is_empty_object(&self) -> bool {
        match self {
            Value::Null => false,
            Value::Bool(_) => false,
            Value::Number(_) => false,
            Value::String(_) => false,
            Value::Array(array) => false,
            Value::Object(object) => object.is_empty(),
        }
    }
}
