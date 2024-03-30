use std::fmt::{self, Display, Formatter};

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
}

//TODO: maybe this is useless, it is only useful for the '?' syntax to convert a borrowed error into an owned error
#[derive(Debug, Error)]
pub enum InternalError<'a> {
    #[error("key '{0}' not found")]
    KeyNotFound(JsonPath<'a>),
    #[error("{0} while filtering inside array '{1}'")]
    InsideArray(Box<Self>, JsonPath<'a>),
}

impl From<InternalError<'_>> for Error {
    fn from(internal_error: InternalError) -> Self {
        match internal_error {
            InternalError::KeyNotFound(path) => Error::KeyNotFound(path.to_owned()),
            InternalError::InsideArray(internal_error, path) => {
                Error::InsideArray(Box::new(Error::from(*internal_error)), path.to_owned())
            }
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

#[derive(Debug, Clone, Copy)]
pub enum JsonPath<'a> {
    Root,
    Node {
        entry: JsonPathEntry<'a>,
        parent: &'a JsonPath<'a>,
    },
}

impl<'a> JsonPath<'a> {
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
        self.to_owned().fmt(f)
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

#[derive(Debug, Clone, Copy)]
pub struct ArrayContext<'a> {
    path: JsonPath<'a>,
}

#[derive(Debug, Clone, Copy)]
pub struct Context<'a> {
    path: JsonPath<'a>,
    array_context: Option<ArrayContext<'a>>,
}

impl<'a> Context<'a> {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn push(&'a self, entry: JsonPathEntry<'a>) -> Self {
        Self {
            path: JsonPath::Node {
                entry,
                parent: &self.path,
            },
            ..*self
        }
    }

    pub fn enter_array(&'a self) -> Self {
        Self {
            array_context: Some(ArrayContext { path: self.path }),
            ..*self
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
                    .ok_or(InternalError::KeyNotFound(new_context.path))?;

                (new_root_json, new_context)
            }
            None => (root_json, root_context),
        };

        self.do_apply(root_json, root_context)
    }

    fn do_apply<'a>(&'a self, value: Value, context: Context<'a>) -> Result<Value, Error> {
        if self.children().is_empty() {
            return Ok(value);
        }

        match value {
            Value::Object(object) => self.do_apply_object(object, context),
            Value::Array(old_array) => self.do_apply_array(old_array, context),
            // TODO: this should fail, since there are children defined but the json is not an object or an array
            // But, if in the context we are inside an array, we should just log a warning and return the json as is
            _ => Ok(value),
        }
    }

    fn do_apply_object(
        &self,
        mut object: Map<String, Value>,
        context: Context,
    ) -> Result<Value, Error> {
        let mut filtered_object = serde_json::Map::new();
        for child in self.children() {
            let Some(QueryKey(child_query_key)) = *child.key() else {
                panic!("children query must have a key");
            };
            let child_context = context.push(JsonPathEntry::Key(child_query_key));

            let child_entry_result = object
                .remove_entry(child_query_key)
                .ok_or(InternalError::KeyNotFound(child_context.path));

            let (child_key, child_value) = match (child_entry_result, child_context.array_context) {
                (Ok(entry), _) => entry,
                (Err(internal_error), None) => return Err(Error::from(internal_error)),
                (Err(internal_error), Some(array_context)) => {
                    let array_error =
                        InternalError::InsideArray(Box::new(internal_error), array_context.path);
                    log::warn!("{array_error}");
                    continue;
                }
            };
            let child_filtered_value = child.do_apply(child_value, child_context)?;
            // TODO: do not insert empty child objects? and empty child arrays?
            filtered_object.insert(child_key, child_filtered_value);
        }
        Ok(Value::Object(filtered_object))
    }

    fn do_apply_array(&self, array: Vec<Value>, context: Context) -> Result<Value, Error> {
        let array_context = context.enter_array();
        array
            .into_iter()
            .enumerate()
            .map(|(index, value)| {
                let index_context = array_context.push(JsonPathEntry::Index(index));
                self.do_apply(value, index_context)
            })
            // TODO: filter empty objects? and what about nested empty arrays?
            .collect::<Result<Vec<Value>, Error>>()
            .map(Value::Array)
            .map_err(|item_error| {
                // Unrecoverable errors inside the array should not happen,
                // since all errors within the array filtering should be caught and logged as a warning...
                Error::InsideArray(Box::new(item_error), array_context.path.to_owned())
            })
    }
}
