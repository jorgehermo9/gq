use std::{borrow::Cow, ops::Range};

use serde_json::Value;
use thiserror::Error;

use crate::query::query_arguments::ValueType;

use super::context::Context;

#[derive(Error, Debug, Clone)]
pub enum Error {
    #[error("'{}' operator is not supported for '{value_type}' type",query_operator.operator_type())]
    UnsupportedType {
        query_operator: QueryOperator,
        value_type: String,
    },
}

#[derive(Debug, Clone)]
pub enum QueryOperator {
    // TODO: support for indexing with strings? ["key"]? Does this makes sense in our case?
    RangeIndexing(Range<usize>),
    //TODO: should query arguments be a type of QueryOperator? so we can to something like
    // {query_key[0](key="x")}
    Indexing(usize),
}

impl QueryOperator {
    pub fn operator_type(&self) -> &str {
        match self {
            Self::RangeIndexing(_) => "range indexing",
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
            Self::RangeIndexing(range) => self.apply_range_indexing(range, value),
            Self::Indexing(index) => self.apply_indexing(*index, value),
        }
    }

    fn apply_range_indexing<'a>(
        &self,
        range: &Range<usize>,
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

        match array {
            Cow::Owned(mut array) => {
                let indexed = array.drain(range.clone()).collect::<Vec<Value>>();
                return Ok(Cow::Owned(Value::Array(indexed)));
            }
            Cow::Borrowed(array) => {
                let indexed = array.get(range.clone()).unwrap_or_default().to_vec();
                return Ok(Cow::Owned(Value::Array(indexed)));
            }
        };
    }

    fn apply_indexing<'a>(
        &self,
        index: usize,
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

        match array {
            Cow::Owned(mut array) => {
                // TODO: handle out of bounds here
                let indexed = array.remove(index);
                return Ok(Cow::Owned(indexed));
            }
            Cow::Borrowed(array) => {
                // TODO: handle out of bounds
                let indexed = array.get(index).expect("out of bounds");
                return Ok(Cow::Borrowed(indexed));
            }
        };
    }
}
