use std::{borrow::Cow, ops::Range};

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
    Range(Range<usize>),
    Index(usize),
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
            Self::Indexing(indexing_value) => match indexing_value {
                IndexingValue::Range(range) => self
                    .apply_range_indexing(range.clone(), value)
                    .map(Cow::Owned),
                IndexingValue::Index(index) => self.apply_indexing(*index, value),
            },
        }
    }

    fn apply_range_indexing<'a>(
        &self,
        range: Range<usize>,
        value: Cow<'a, Value>,
    ) -> Result<Value, Error> {
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

        let result = match array {
            Cow::Owned(mut array) => array.drain(range).collect::<Vec<Value>>(),
            Cow::Borrowed(array) => array
                .get(range.clone())
                .expect("TODO: handle range out of bounds")
                .to_vec(),
        };
        Ok(Value::Array(result))
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

#[derive(Debug, Clone, Constructor, Default)]
pub struct QueryOperators(Vec<QueryOperator>);

impl QueryOperators {
    pub fn apply<'a>(
        &self,
        value: Cow<'a, Value>,
        context: &Context,
    ) -> Result<Cow<'a, Value>, Error> {
        // TODO: handle context
        let mut value = value;
        for operator in self.0.iter() {
            value = operator.apply(value, context)?;
        }
        Ok(value)
    }
}
