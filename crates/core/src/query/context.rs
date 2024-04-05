use std::{
    fmt::{self, Display, Formatter},
    rc::Rc,
};

use derive_getters::Getters;

use super::{AtomicQueryKey, QueryKey};

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

    // TODO: Change all of this `to_owned` to `From` trait
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

#[derive(Debug, Clone, Getters)]
pub struct ArrayContext<'a> {
    path: JsonPath<'a>,
}

#[derive(Debug, Clone, Getters)]
pub struct Context<'a> {
    path: JsonPath<'a>,
    array_context: Option<ArrayContext<'a>>,
}

impl<'a> Context<'a> {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn push_entry(&self, entry: JsonPathEntry<'a>) -> Context<'a> {
        Self {
            path: self.path.push(entry),
            ..self.clone()
        }
    }

    pub fn push_query_key(&self, query_key: &QueryKey<'a>) -> Context<'a> {
        let mut path = self.path.clone();
        for AtomicQueryKey(key) in &query_key.keys {
            path = path.push(JsonPathEntry::Key(key));
        }
        Self {
            path,
            ..self.clone()
        }
    }

    pub fn enter_array(&self) -> Self {
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
