use std::{
    fmt::{self, Display, Formatter},
    rc::Rc,
};

use derive_getters::Getters;

use super::{query_key::QueryKey, RawKey};

#[derive(Debug, Clone, Copy)]
pub enum JsonPathEntry<'a> {
    Key(&'a str),
    Index(usize),
}

// TODO: use Cow instead of an owned version like the AtomicQueryKey
#[derive(Debug, Clone)]
pub enum OwnedJsonPathEntry {
    Key(String),
    Index(usize),
}

impl From<&JsonPathEntry<'_>> for OwnedJsonPathEntry {
    fn from(entry: &JsonPathEntry) -> Self {
        match entry {
            JsonPathEntry::Key(key) => OwnedJsonPathEntry::Key(key.to_string()),
            JsonPathEntry::Index(index) => OwnedJsonPathEntry::Index(*index),
        }
    }
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
}

impl Display for JsonPath<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            JsonPath::Root => write!(f, "."),
            JsonPath::Node { entry, parent } => {
                match **parent {
                    JsonPath::Root => {}
                    _ => parent.fmt(f)?,
                }
                match entry {
                    JsonPathEntry::Key(key) => write!(f, ".{key}"),
                    JsonPathEntry::Index(index) => write!(f, "[{index}]"),
                }
            }
        }
    }
}

#[derive(Debug, Clone)]
pub struct OwnedJsonPath(pub Vec<OwnedJsonPathEntry>);

impl From<&JsonPath<'_>> for OwnedJsonPath {
    fn from(json_path: &JsonPath) -> Self {
        let mut key_path = Vec::new();
        let mut current = json_path;
        while let JsonPath::Node { entry, parent } = current {
            key_path.push(OwnedJsonPathEntry::from(entry));
            current = parent;
        }
        key_path.reverse();
        OwnedJsonPath(key_path)
    }
}

impl Display for OwnedJsonPath {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        if self.0.is_empty() {
            return write!(f, ".");
        }
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

    // TODO: see if &'a is necessary
    pub fn push_raw_key(&self, raw_key: &'a RawKey<'a>) -> Context<'a> {
        let entry = JsonPathEntry::Key(raw_key.0.as_ref());
        self.push_entry(entry)
    }

    pub fn push_index(&self, index: usize) -> Context<'a> {
        let entry = JsonPathEntry::Index(index);
        self.push_entry(entry)
    }

    // TODO: see if &'a is necessary
    pub fn push_query_key(&self, query_key: &'a QueryKey<'a>) -> Context<'a> {
        let mut path = self.path.clone();
        // TODO: cleanup here
        for atomic_query_key in query_key.keys() {
            path = path.push(JsonPathEntry::Key(atomic_query_key.key().0.as_ref()));
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

    fn push_entry(&self, entry: JsonPathEntry<'a>) -> Context<'a> {
        Self {
            path: self.path.push(entry),
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
