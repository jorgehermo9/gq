use std::collections::HashSet;
use std::fmt::{self, Display, Formatter};

use derive_builder::{Builder, UninitializedFieldError};
use derive_getters::Getters;
use thiserror::Error;

pub mod apply;
mod context;
mod query_argument;
mod query_key;

pub use self::context::OwnedJsonPath;
pub use self::query_argument::{QueryArgument, QueryArgumentValue};
pub use self::query_key::{AtomicQueryKey, OwnedAtomicQueryKey, OwnedQueryKey, QueryKey};

#[derive(Debug, Error)]
pub enum Error {
    #[error("root query builder error: {0}")]
    RootBuilderError(#[from] RootQueryBuilderError),
    #[error("child query builder error: {0}")]
    ChildBuilderError(#[from] ChildQueryBuilderError),
}

#[derive(Debug, Error)]
pub enum RootQueryValidationError {
    #[error("root query has children with duplicated output keys: '{0}'")]
    DuplicatedOutputKeyInRoot(OwnedAtomicQueryKey),
}

#[derive(Debug, Error)]
pub enum RootQueryBuilderError {
    #[error("{0}")]
    UninitializedFields(#[from] UninitializedFieldError),
    #[error("{0}")]
    ValidationError(#[from] RootQueryValidationError),
}

#[derive(Clone, Getters, Debug, Builder)]
#[builder(
    pattern = "owned",
    setter(into, strip_option),
    build_fn(validate = "Self::validate", error = "RootQueryBuilderError")
)]
pub struct Query<'a> {
    #[builder(default)]
    key: Option<QueryKey<'a>>,
    #[builder(default)]
    children: Vec<ChildQuery<'a>>,
    #[builder(default)]
    // TODO: Maybe we should wrap the vec in a newtype struct `QueryArguments`
    // so we do not repeat logic between `Query` and `ChildQuery`
    arguments: Vec<QueryArgument<'a>>,
}

impl QueryBuilder<'_> {
    fn validate(&self) -> Result<(), RootQueryValidationError> {
        self.validate_children()
    }
    fn validate_children(&self) -> Result<(), RootQueryValidationError> {
        // TODO: validation is done before building errors/defaults... Check if
        // validation could be done AFTER in the documentation
        let mut output_keys = HashSet::new();
        let Some(children) = self.children.as_ref() else {
            return Ok(());
        };
        for child in children {
            let output_key = child.output_key();
            if !output_keys.insert(output_key) {
                return Err(RootQueryValidationError::DuplicatedOutputKeyInRoot(
                    output_key.clone().into_owned(),
                ));
            }
        }
        Ok(())
    }
}

#[derive(Debug, Error)]
pub enum ChildQueryValidationError {
    #[error("query '{0}' has children with duplicated output keys: '{1}'")]
    DuplicatedOutputKey(OwnedQueryKey, OwnedAtomicQueryKey),
}

#[derive(Debug, Error)]
pub enum ChildQueryBuilderError {
    #[error("{0}")]
    UninitializedFields(#[from] UninitializedFieldError),
    #[error("{0}")]
    ValidationError(#[from] ChildQueryValidationError),
}

#[derive(Clone, Getters, Debug, Builder)]
#[builder(
    pattern = "owned",
    build_fn(validate = "Self::validate", error = "ChildQueryBuilderError")
)]
pub struct ChildQuery<'a> {
    #[builder(default)]
    alias: Option<AtomicQueryKey<'a>>,
    key: QueryKey<'a>,
    #[builder(default)]
    children: Vec<ChildQuery<'a>>,
    #[builder(default)]
    arguments: Vec<QueryArgument<'a>>,
}

impl ChildQueryBuilder<'_> {
    fn validate(&self) -> Result<(), ChildQueryValidationError> {
        self.validate_children()
    }
    fn validate_children(&self) -> Result<(), ChildQueryValidationError> {
        // TODO: validation is done before building errors/defaults... Check if
        // validation could be done AFTER in the documentation
        let mut output_keys = HashSet::new();
        let Some(children) = self.children.as_ref() else {
            return Ok(());
        };
        for child in children {
            let output_key = child.output_key();
            if !output_keys.insert(output_key) {
                let child_key = self.key.as_ref().expect("child key must be defined");
                return Err(ChildQueryValidationError::DuplicatedOutputKey(
                    child_key.clone().into_owned(),
                    output_key.clone().into_owned(),
                ));
            }
        }
        Ok(())
    }
}

impl<'a> ChildQuery<'a> {
    pub fn output_key(&self) -> &AtomicQueryKey {
        self.alias()
            .as_ref()
            .unwrap_or_else(|| self.key().last_key())
    }
}

impl Display for Query<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let formatted = self.pretty_format(2);
        formatted.fmt(f)
    }
}

impl Query<'_> {
    // TODO: do a test for this function, so parsing a formatted query, outputs the
    // same original query...
    pub fn pretty_format(&self, indent: usize) -> String {
        let mut result = String::new();

        let sep = if indent == 0 { ' ' } else { '\n' };

        match self.key() {
            Some(key) => {
                if self.children().is_empty() {
                    return key.to_string();
                }
                result.push_str(&format!("{key} "));
            }
            None => {
                if self.children().is_empty() {
                    return "{ }".to_string();
                }
            }
        }

        result.push_str(&format!("{{{sep}"));
        for child in self.children() {
            child.do_pretty_format(&mut result, indent, 1, sep);
        }
        result.push('}');

        result
    }
}
impl ChildQuery<'_> {
    fn do_pretty_format(&self, result: &mut String, indent: usize, level: usize, sep: char) {
        let indentation = " ".repeat(indent * level);

        let query_key = self.key();

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
