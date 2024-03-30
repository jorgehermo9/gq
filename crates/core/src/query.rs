use std::fmt::{self, Display, Formatter};

use derive_getters::Getters;
use derive_more::Constructor;
use serde_json::Value;
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
    #[error("Key '{0}' not found")]
    KeyNotFound(OwnedJsonPath),
}

#[derive(Debug)]
pub enum InternalError<'a> {
    KeyNotFound(&'a JsonPath<'a>),
}

impl From<InternalError<'_>> for Error {
    fn from(internal_error: InternalError) -> Self {
        match internal_error {
            InternalError::KeyNotFound(path) => Error::KeyNotFound(path.to_owned()),
        }
    }
}

#[derive(Debug)]
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

#[derive(Debug)]
pub enum OwnedJsonPathEntry {
    Key(String),
    Index(usize),
}

#[derive(Debug)]
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

#[derive(Debug)]
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

#[derive(Debug)]
pub struct Context<'a> {
    path: JsonPath<'a>,
}

impl Context<'_> {
    pub fn to_owned(&self) -> OwnedContext {
        OwnedContext {
            path: self.path.to_owned(),
        }
    }
}

#[derive(Debug)]
pub struct OwnedContext {
    path: OwnedJsonPath,
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
        }
    }
}
impl<'a> Default for Context<'a> {
    fn default() -> Self {
        Self {
            path: JsonPath::Root,
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
                (
                    root_json
                        .get_mut(key)
                        .ok_or(InternalError::KeyNotFound(&new_context.path))?
                        .take(),
                    new_context,
                )
            }
            None => (root_json, root_context),
        };

        self.do_apply(root_json, root_context)
    }

    fn do_apply(&self, json: Value, context: Context) -> Result<Value, Error> {
        let children = self.children();
        if children.is_empty() {
            return Ok(json);
        }

        match json {
            Value::Object(mut old_object) => {
                let mut filtered_object = serde_json::Map::new();
                // TODO: can this be done with a more functional approach, like the Value::Array case?
                for child in children {
                    let Some(QueryKey(key)) = child.key() else {
                        panic!("children query must have a key");
                    };
                    let child_context = context.push(JsonPathEntry::Key(key));
                    let child_value = old_object
                        .get_mut(*key)
                        // TODO: do not '?' if if the context we are inside an array, just log warns
                        // TODO: save in the context the first key that initialized the array
                        .ok_or(InternalError::KeyNotFound(&child_context.path))?
                        .take();
                    let child_filtered_value = child.do_apply(child_value, child_context)?;
                    filtered_object.insert(key.to_string(), child_filtered_value);
                }
                // TODO: what to do if filtered_object is empty and no key was inserted? (maybe because of an error in the children queries
                // inside arrays...)
                Ok(Value::Object(filtered_object))
            }
            Value::Array(old_array) => {
                let filtered_array = old_array
                    .into_iter()
                    .enumerate()
                    .map(|(index, value)| {
                        let index_context = context.push(JsonPathEntry::Index(index));
                        self.do_apply(value, index_context)
                    })
                    .flat_map(|result| {
                        let array_path = context.path.to_owned();
                        // TODO: maybe this error reporting is no necessary, since if we are inside an array,
                        // the children should not raise errors and jsut log warns... this branch should never occur
                        result.map_err(|error| {
                            log::warn!("{error} while filtering array at '{array_path}'");
                        })
                    })
                    // TODO: collect this again into `.collect::<Result<Vec<Value>, Error>>()?`, the children are
                    // the ones that should return
                    .collect::<Vec<Value>>();
                Ok(Value::Array(filtered_array))
            }
            // TODO: handle error if there are more children left...
            _ => Ok(json),
        }
    }
}
