use std::collections::HashSet;

use derive_builder::{Builder, UninitializedFieldError};
use derive_getters::Getters;
use thiserror::Error;

pub mod apply;
mod context;
pub mod format;
pub mod query_arguments;
mod query_key;

pub use self::context::OwnedJsonPath;
use self::query_arguments::QueryArguments;
pub use self::query_key::{AtomicQueryKey, QueryKey};

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
    DuplicatedOutputKeyInRoot(String),
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
    build_fn(validate = "Self::validate", error = "RootQueryBuilderError")
)]
pub struct Query {
    #[builder(default)]
    pub arguments: QueryArguments,
    #[builder(default)]
    pub key: QueryKey,
    #[builder(default)]
    pub children: Vec<ChildQuery>,
}

impl QueryBuilder {
    fn validate(&self) -> Result<(), RootQueryValidationError> {
        self.validate_children()
    }
    fn validate_children(&self) -> Result<(), RootQueryValidationError> {
        let mut output_keys = HashSet::new();
        let Some(children) = self.children.as_ref() else {
            return Ok(());
        };
        for child in children {
            let child_query_key = child.output_key();
            if !output_keys.insert(child_query_key) {
                return Err(RootQueryValidationError::DuplicatedOutputKeyInRoot(
                    child_query_key.clone(),
                ));
            }
        }
        Ok(())
    }
}

#[derive(Debug, Error)]
pub enum ChildQueryValidationError {
    #[error("query '{0}' has children with duplicated output keys: '{1}'")]
    // TODO: Maybe we should not use String and use the owned version of the QueryKey
    DuplicatedOutputKey(String, String),
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
pub struct ChildQuery {
    // TODO: query alias should be a String?
    #[builder(default)]
    alias: Option<String>,
    // TODO: those fields should not be pub, they must be validated
    pub key: QueryKey,
    #[builder(default)]
    pub children: Vec<ChildQuery>,
}

impl ChildQueryBuilder {
    fn validate(&self) -> Result<(), ChildQueryValidationError> {
        self.validate_children()
    }
    fn validate_children(&self) -> Result<(), ChildQueryValidationError> {
        let mut output_keys = HashSet::new();
        let Some(children) = self.children.as_ref() else {
            return Ok(());
        };
        for child in children {
            let child_output_key = child.output_key();
            if !output_keys.insert(child_output_key) {
                let child_key = self.key.as_ref().expect("child key must be defined");
                return Err(ChildQueryValidationError::DuplicatedOutputKey(
                    child_key.to_string(),
                    child_output_key.clone(),
                ));
            }
        }
        Ok(())
    }
}

impl ChildQuery {
    pub fn output_key(&self) -> &String {
        self.alias()
            .as_ref()
            .unwrap_or_else(|| self.key().last_key().key())
    }
}
