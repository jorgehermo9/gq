use std::collections::HashSet;

use derive_builder::{Builder, UninitializedFieldError};
use derive_getters::Getters;
use query_key::{QueryKey, RawKey};
use query_operator::QueryOperator;
use thiserror::Error;

pub mod apply;
mod context;
pub mod format;
pub mod query_arguments;
pub mod query_key;
pub mod query_operator;

pub use self::context::OwnedJsonPath;
use self::query_arguments::QueryArguments;

#[derive(Debug, Error)]
pub enum Error {
    #[error("root query builder error: {0}")]
    RootBuilderError(#[from] RootQueryBuilderError),
    #[error("child query builder error: {0}")]
    ChildBuilderError(#[from] ChildQueryBuilderError),
}

#[derive(Debug, Error)]
pub enum RootQueryValidationError {
    // TODO: maybe we shouldnt wrap RawKey between ' '?
    #[error("root query has children with duplicated output keys: '{0}'")]
    DuplicatedOutputKeyInRoot(RawKey),
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
    pub operator: Option<QueryOperator>,
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
    // TODO: maybe we shouldnt wrap RawKey between ' '?
    #[error("query '{0}' has children with duplicated output keys: '{1}'")]
    DuplicatedOutputKey(String, RawKey),
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
    #[builder(default)]
    alias: Option<RawKey>,
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
    pub fn output_key(&self) -> &RawKey {
        self.alias()
            .as_ref()
            .unwrap_or_else(|| self.key().last_key().key())
    }
}
