use std::collections::HashSet;
use std::fmt::{self, Display, Formatter};

use derive_getters::Getters;
use thiserror::Error;

pub mod apply;
mod context;
mod query_key;

pub use self::context::OwnedJsonPath;
pub use self::query_key::{AtomicQueryKey, OwnedAtomicQueryKey, OwnedQueryKey, QueryKey};

#[derive(Debug, Error)]
pub enum Error {
    #[error("query '{0}' has children with duplicated output keys: '{1}'")]
    DuplicatedOutputKey(OwnedQueryKey, OwnedAtomicQueryKey),
    #[error("root query has children with duplicated output keys: '{0}'")]
    DuplicatedOutputKeyInRoot(OwnedAtomicQueryKey),
}

// TODO: make the invalid states irrepresentable, the children could never be None...
// maybe the Query struct should have a children field that is a Vec<ChildrenQuery>, which
// cannot allow to unnamed keys...
// Maybe we should have a RootQuery and a ChildQuery... inside a Query enum...

#[derive(Getters, Debug)]
pub struct Query<'a> {
    alias: Option<AtomicQueryKey<'a>>,
    key: Option<QueryKey<'a>>,
    children: Vec<Self>,
}
impl<'a> Query<'a> {
    pub fn unnamed_with_children(children: Vec<Self>) -> Result<Self, Error> {
        // TODO: fix this, it is a bad design
        Self::validate_children(None, &children)?;
        Ok(Self {
            alias: None,
            key: None,
            children,
        })
    }

    pub fn named_empty(query_alias: Option<AtomicQueryKey<'a>>, query_key: QueryKey<'a>) -> Self {
        Self {
            alias: query_alias,
            key: Some(query_key),
            children: vec![],
        }
    }

    pub fn named_with_children(
        query_alias: Option<AtomicQueryKey<'a>>,
        query_key: QueryKey<'a>,
        children: Vec<Self>,
    ) -> Result<Self, Error> {
        Self::validate_children(Some(&query_key), &children)?;
        Ok(Self {
            alias: query_alias,
            key: Some(query_key),
            children,
        })
    }

    fn validate_children(query_key: Option<&QueryKey<'a>>, children: &[Self]) -> Result<(), Error> {
        let mut output_keys = HashSet::new();
        for child in children {
            let output_key = child.output_key();
            if !output_keys.insert(output_key) {
                match query_key {
                    Some(query_key) => {
                        // TODO: improve the cloning?
                        return Err(Error::DuplicatedOutputKey(
                            query_key.clone().into_owned(),
                            output_key.clone().into_owned(),
                        ));
                    }
                    None => {
                        return Err(Error::DuplicatedOutputKeyInRoot(
                            output_key.clone().into_owned(),
                        ));
                    }
                }
            }
        }
        Ok(())
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

// TODO: do a validation of the final key collision. Aliases would be need so this errors can be resolved.
// For example, this query:
// ```{
//  actor.login
//  payload.pull_request.head.repo.owner.login
//}
//```
// TODO: when the root query has an alias, it should fail
