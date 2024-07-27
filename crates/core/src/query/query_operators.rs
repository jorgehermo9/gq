use std::{borrow::Cow, fmt::Display, ops::RangeInclusive};

use derive_more::Constructor;
use serde_json::Value;
use thiserror::Error;

use super::context::Context;
use crate::query::query_arguments::ValueType;

#[derive(Error, Debug, Clone)]
pub enum Error {
    #[error("'{}' operator is not supported for '{value_type}' type",query_operator.operator_type())]
    UnsupportedType {
        query_operator: QueryOperator,
        value_type: String,
    },
}

#[derive(Debug, Clone)]
pub enum IndexingValue {
    // TODO: use `std::ops::RangeBounds` instead of `Range` in order to be more generic?
    Range(RangeInclusive<usize>),
    Index(usize),
}

impl IndexingValue {
    // TODO: maybe we should return Result for out of bounds handling
    pub fn apply<'a>(&self, array: Cow<'a, Vec<Value>>) -> Cow<'a, Value> {
        match self {
            Self::Range(range) => {
                let result = match array {
                    Cow::Owned(mut array) => array.drain(range.clone()).collect::<Vec<Value>>(),
                    Cow::Borrowed(array) => array
                        .get(range.clone())
                        .expect("TODO: handle range out of bounds")
                        // Note that this `to_vec` clones the underlying `Values`
                        .to_vec(),
                };
                Cow::Owned(Value::Array(result))
            }
            Self::Index(index) => {
                match array {
                    Cow::Owned(mut array) => {
                        // TODO: handle out of bounds here
                        let indexed = array.remove(*index);
                        Cow::Owned(indexed)
                    }
                    Cow::Borrowed(array) => {
                        // TODO: handle out of bounds
                        let indexed = array.get(*index).expect("out of bounds");
                        Cow::Borrowed(indexed)
                    }
                }
            }
        }
    }
}

impl Display for IndexingValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Range(range) => write!(f, "{}..{}", range.start(), range.end()),
            Self::Index(index) => index.fmt(f),
        }
    }
}

#[derive(Debug, Clone)]
pub enum QueryOperator {
    // TODO: support for indexing with strings? ["key"]? Does this makes sense in our case?
    //TODO: should query arguments be a type of QueryOperator? so we can to something like
    // {query_key[0](key="x")}
    Indexing(IndexingValue),
}

impl QueryOperator {
    pub fn operator_type(&self) -> &str {
        match self {
            Self::Indexing(_) => "indexing",
        }
    }
    pub fn apply<'a>(
        &self,
        value: Cow<'a, Value>,
        // TODO: use context or remove it
        _context: &Context,
    ) -> Result<Cow<'a, Value>, Error> {
        match self {
            Self::Indexing(indexing_value) => self.apply_indexing(indexing_value, value),
        }
    }

    fn apply_indexing<'a>(
        &self,
        indexing_value: &IndexingValue,
        value: Cow<'a, Value>,
    ) -> Result<Cow<'a, Value>, Error> {
        let array = match value {
            Cow::Owned(Value::Array(array)) => Cow::Owned(array),
            Cow::Borrowed(Value::Array(array)) => Cow::Borrowed(array),
            value => {
                return Err(Error::UnsupportedType {
                    query_operator: self.clone(),
                    value_type: value.value_type(),
                })
            }
        };

        Ok(indexing_value.apply(array))
    }
}

impl Display for QueryOperator {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Indexing(indexing_value) => write!(f, "[{indexing_value}]"),
        }
    }
}

#[derive(Debug, Clone, Constructor, Default)]
pub struct QueryOperators(pub Vec<QueryOperator>);

impl QueryOperators {
    pub fn apply<'a>(
        &self,
        value: Cow<'a, Value>,
        context: &Context,
    ) -> Result<Cow<'a, Value>, Error> {
        // TODO: handle context
        self.0
            .iter()
            .try_fold(value, |value, operator| operator.apply(value, context))
    }
}

impl Display for QueryOperators {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.iter().try_for_each(|operator| operator.fmt(f))
    }
}
