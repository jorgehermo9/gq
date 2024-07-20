use std::{
    borrow::Cow,
    fmt::{self, Display, Formatter},
};

use super::{
    apply::InternalError,
    context::{Context, JsonPath},
    QueryKey,
};
use derive_getters::Getters;
use derive_more::{Constructor, Display};
use regex::Regex;
use serde_json::Value;
use thiserror::Error;

#[derive(Debug, Clone, Error)]
pub enum Error<'a> {
    #[error("types '{value_type}' and '{operation_value_type}' are not comparable at '{context}'")]
    IncomparableTypes {
        value_type: String,
        operation_value_type: String,
        context: JsonPath<'a>,
    },
    #[error(
        "operation '{operation_type}' is not compatible with value type '{value_type}' at '{context}'"
    )]
    IncompatibleOperation {
        value_type: String,
        operation_type: String,
        context: JsonPath<'a>,
    },
    // TODO: is this necessary?
    // #[error("cannot conver number '{0}' to f64 at {1}")]
    // NumberConversionError(Number, JsonPath<'a>),
    #[error("{error} while processing arguments at '{context}'")]
    InsideArguments {
        error: Box<Self>,
        context: JsonPath<'a>,
    },
    #[error("{0}")]
    InternalError(InternalError<'a>),
}

impl<'a> From<InternalError<'a>> for Error<'a> {
    fn from(internal_error: InternalError<'a>) -> Self {
        Self::InternalError(internal_error)
    }
}

// TODO: This trait and implementations are very messy, re-structure them (in other modules?)
pub trait ValueType {
    fn value_type(&self) -> String;
}

impl ValueType for Value {
    fn value_type(&self) -> String {
        match self {
            Value::String(_) => "string".to_string(),
            Value::Number(_) => "number".to_string(),
            Value::Bool(_) => "bool".to_string(),
            Value::Null => "null".to_string(),
            Value::Array(_) => "array".to_string(),
            Value::Object(_) => "object".to_string(),
        }
    }
}

impl ValueType for QueryArgumentValue {
    fn value_type(&self) -> String {
        match self {
            QueryArgumentValue::String(_) => "string".to_string(),
            QueryArgumentValue::Number(_) => "number".to_string(),
            QueryArgumentValue::Bool(_) => "bool".to_string(),
            QueryArgumentValue::Null => "null".to_string(),
        }
    }
}

impl ValueType for Number {
    fn value_type(&self) -> String {
        match self {
            Number::PosInteger(_) | Number::NegInteger(_) => "integer".to_string(),
            Number::Float(_) => "float".to_string(),
        }
    }
}

impl ValueType for Regex {
    fn value_type(&self) -> String {
        "regex".to_string()
    }
}

impl ValueType for QueryArgumentOperation {
    fn value_type(&self) -> String {
        match self {
            QueryArgumentOperation::Equal(value) => value.value_type(),
            QueryArgumentOperation::NotEqual(value) => value.value_type(),
            QueryArgumentOperation::Greater(value) => value.value_type(),
            QueryArgumentOperation::GreaterEqual(value) => value.value_type(),
            QueryArgumentOperation::Less(value) => value.value_type(),
            QueryArgumentOperation::LessEqual(value) => value.value_type(),
            QueryArgumentOperation::Match(value) => value.value_type(),
            QueryArgumentOperation::NotMatch(value) => value.value_type(),
        }
    }
}

pub trait OperationType {
    fn operation_type(&self) -> String;
}

impl OperationType for QueryArgumentOperation {
    fn operation_type(&self) -> String {
        match self {
            QueryArgumentOperation::Equal(_) => "=".to_string(),
            QueryArgumentOperation::NotEqual(_) => "!=".to_string(),
            QueryArgumentOperation::Greater(_) => ">".to_string(),
            QueryArgumentOperation::GreaterEqual(_) => ">=".to_string(),
            QueryArgumentOperation::Less(_) => "<".to_string(),
            QueryArgumentOperation::LessEqual(_) => "<=".to_string(),
            QueryArgumentOperation::Match(_) => "~".to_string(),
            QueryArgumentOperation::NotMatch(_) => "!~".to_string(),
        }
    }
}

#[derive(Debug, Clone, Display)]
pub enum Number {
    PosInteger(u64),
    NegInteger(i64),
    Float(f64),
}

impl From<u64> for Number {
    fn from(value: u64) -> Self {
        Self::PosInteger(value)
    }
}

impl From<i64> for Number {
    fn from(value: i64) -> Self {
        Self::NegInteger(value)
    }
}

impl From<f64> for Number {
    fn from(value: f64) -> Self {
        Self::Float(value)
    }
}

impl PartialEq<serde_json::Number> for Number {
    fn eq(&self, other: &serde_json::Number) -> bool {
        match self {
            Self::NegInteger(lhs_i64) if other.is_i64() => {
                other.as_i64().expect("wrong conversion").eq(lhs_i64)
            }
            Self::PosInteger(lhs_u64) if other.is_u64() => {
                other.as_u64().expect("wrong conversion").eq(lhs_u64)
            }
            Self::Float(lhs_f64) if other.is_f64() => {
                other.as_f64().expect("wrong conversion").eq(lhs_f64)
            }
            _ => todo!("handle number implicit casting"),
        }
    }
}

impl PartialEq<Number> for serde_json::Number {
    fn eq(&self, other: &Number) -> bool {
        other.eq(self)
    }
}

impl PartialOrd<serde_json::Number> for Number {
    fn partial_cmp(&self, other: &serde_json::Number) -> Option<std::cmp::Ordering> {
        match self {
            Self::NegInteger(lhs_i64) if other.is_i64() => other
                .as_i64()
                .expect("wrong conversion")
                .partial_cmp(lhs_i64),
            Self::PosInteger(lhs_u64) if other.is_u64() => other
                .as_u64()
                .expect("wrong conversion")
                .partial_cmp(lhs_u64),
            Self::Float(lhs_f64) if other.is_f64() => other
                .as_f64()
                .expect("wrong conversion")
                .partial_cmp(lhs_f64),
            _ => todo!("handle number implicit casting"),
        }
    }
}

impl PartialOrd<Number> for serde_json::Number {
    fn partial_cmp(&self, other: &Number) -> Option<std::cmp::Ordering> {
        other.partial_cmp(self)
    }
}

#[derive(Debug, Clone)]
pub enum QueryArgumentValue {
    String(String),
    Number(Number),
    Bool(bool),
    Null,
}

impl Display for QueryArgumentValue {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            QueryArgumentValue::String(value) => write!(f, "\"{value}\""),
            QueryArgumentValue::Number(value) => write!(f, "{value}"),
            QueryArgumentValue::Bool(value) => write!(f, "{value}"),
            QueryArgumentValue::Null => write!(f, "null"),
        }
    }
}

#[derive(Debug, Clone)]
pub enum QueryArgumentOperation {
    Equal(QueryArgumentValue),
    NotEqual(QueryArgumentValue),
    Greater(Number),
    GreaterEqual(Number),
    Less(Number),
    LessEqual(Number),
    Match(Regex),
    NotMatch(Regex),
}

impl Display for QueryArgumentOperation {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        // TODO: create a pretty format method or use this in Query::pretty_format
        match self {
            QueryArgumentOperation::Equal(value) => write!(f, "={value}"),
            QueryArgumentOperation::NotEqual(value) => write!(f, "!={value}"),
            QueryArgumentOperation::Greater(value) => write!(f, ">{value}"),
            QueryArgumentOperation::GreaterEqual(value) => write!(f, ">={value}"),
            QueryArgumentOperation::Less(value) => write!(f, "<{value}"),
            QueryArgumentOperation::LessEqual(value) => write!(f, "<={value}"),
            QueryArgumentOperation::Match(regex) => write!(f, "~\"{regex}\""),
            QueryArgumentOperation::NotMatch(regex) => write!(f, "!~\"{regex}\""),
        }
    }
}

impl<'a> QueryArgumentOperation {
    fn satisfies(&self, value: &Value, context: &Context<'a>) -> Result<bool, Error<'a>> {
        match self {
            QueryArgumentOperation::Equal(operation_value) => {
                self.satisfies_equal(operation_value, value, context)
            }
            QueryArgumentOperation::NotEqual(operation_value) => self
                .satisfies_equal(operation_value, value, context)
                .map(|result| !result),
            QueryArgumentOperation::Greater(operation_value) => {
                self.satisfies_greater(operation_value, value, context)
            }
            QueryArgumentOperation::GreaterEqual(operation_value) => self
                .satisfies_less(operation_value, value, context)
                .map(|result| !result),
            QueryArgumentOperation::Less(operation_value) => {
                self.satisfies_less(operation_value, value, context)
            }
            QueryArgumentOperation::LessEqual(operation_value) => self
                .satisfies_greater(operation_value, value, context)
                .map(|result| !result),
            QueryArgumentOperation::Match(operation_value) => {
                self.satisfies_match(operation_value, value, context)
            }
            QueryArgumentOperation::NotMatch(operation_value) => self
                .satisfies_match(operation_value, value, context)
                .map(|result| !result),
        }
    }

    fn satisfies_op_array<F>(array: &[Value], satisfies_op: F, context: &Context<'a>) -> bool
    where
        F: Fn(&Value, &Context<'a>) -> Result<bool, Error<'a>>,
    {
        array
            .iter()
            .enumerate()
            .map(|(index, item)| (context.push_index(index), item))
            .map(|(item_context, item)| satisfies_op(item, &item_context))
            .any(|result| {
                result
                    .map_err(|error| {
                        log::warn!("{error}");
                    })
                    .unwrap_or(false)
            })
    }

    fn satisfies_equal(
        &self,
        operation_value: &QueryArgumentValue,
        value: &Value,
        context: &Context<'a>,
    ) -> Result<bool, Error<'a>> {
        match (operation_value, value) {
            (QueryArgumentValue::String(operation_value), Value::String(value)) => {
                Ok(operation_value == value)
            }
            (QueryArgumentValue::Number(operation_value), Value::Number(value)) => {
                Ok(operation_value == value)
            }
            (QueryArgumentValue::Bool(operation_value), Value::Bool(value)) => {
                Ok(operation_value == value)
            }
            (QueryArgumentValue::Null, Value::Null) => Ok(true),
            (QueryArgumentValue::Null, _) => Ok(false),
            (_, Value::Null) => Ok(false),
            (_, Value::Array(array)) => {
                let satisfies_op = |item: &Value, context: &Context<'a>| {
                    self.satisfies_equal(operation_value, item, context)
                };
                Ok(Self::satisfies_op_array(array, satisfies_op, context))
            }
            _ => Err(self.incomparable_types_error(operation_value, value, context)),
        }
    }
    fn satisfies_greater(
        &self,
        operation_value: &Number,
        value: &Value,
        context: &Context<'a>,
    ) -> Result<bool, Error<'a>> {
        match value {
            Value::Number(value) => Ok(value > operation_value),
            Value::Array(array) => {
                let satisfies_op = |item: &Value, context: &Context<'a>| {
                    self.satisfies_greater(operation_value, item, context)
                };
                Ok(Self::satisfies_op_array(array, satisfies_op, context))
            }
            _ => Err(self.incompatible_operation_error(value, context)),
        }
    }

    fn satisfies_less(
        &self,
        operation_value: &Number,
        value: &Value,
        context: &Context<'a>,
    ) -> Result<bool, Error<'a>> {
        match value {
            Value::Number(value) => Ok(value < operation_value),
            Value::Array(array) => {
                let satisfies_op = |item: &Value, context: &Context<'a>| {
                    self.satisfies_less(operation_value, item, context)
                };
                Ok(Self::satisfies_op_array(array, satisfies_op, context))
            }
            _ => Err(self.incompatible_operation_error(value, context)),
        }
    }

    fn satisfies_match(
        &self,
        operation_value: &Regex,
        value: &Value,
        context: &Context<'a>,
    ) -> Result<bool, Error<'a>> {
        match value {
            Value::String(value) => Ok(operation_value.is_match(value)),
            Value::Array(array) => {
                let satisfies_op = |item: &Value, context: &Context<'a>| {
                    self.satisfies_match(operation_value, item, context)
                };
                Ok(Self::satisfies_op_array(array, satisfies_op, context))
            }
            _ => Err(self.incompatible_operation_error(value, context)),
        }
    }

    fn incomparable_types_error<T: ValueType, U: ValueType>(
        &self,
        operation_value: &T,
        value: &U,
        context: &Context<'a>,
    ) -> Error<'a> {
        let value_type = value.value_type();
        let operation_value_type = operation_value.value_type();
        Error::IncomparableTypes {
            value_type,
            operation_value_type,
            context: context.path().clone(),
        }
    }
    fn incompatible_operation_error<T: ValueType>(
        &self,
        value: &T,
        context: &Context<'a>,
    ) -> Error<'a> {
        let value_type = value.value_type();
        let operation_type = self.operation_type();
        Error::IncompatibleOperation {
            value_type,
            operation_type,
            context: context.path().clone(),
        }
    }
}

#[derive(Debug, Clone, Constructor, Getters)]
pub struct QueryArgument {
    key: QueryKey,
    operation: QueryArgumentOperation,
}

impl Display for QueryArgument {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let key = self.key();
        let operation = self.operation();
        write!(f, "{key}{operation}")
    }
}

#[derive(Debug, Clone, Constructor, Default)]
pub struct QueryArguments(pub Vec<QueryArgument>);

impl Display for QueryArguments {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let arguments = self
            .0
            .iter()
            .map(ToString::to_string)
            .collect::<Vec<_>>()
            .join(", ");
        arguments.fmt(f)
    }
}

impl QueryArguments {
    //TODO: improve method naming
    pub fn satisfies(&self, value: &Value, context: &Context) -> bool {
        self.0.iter().all(|argument| {
            argument
                .satisfies(value, context)
                .map_err(|error| {
                    let argument_error = Error::InsideArguments {
                        // TODO: include the argument.to_string() here?
                        error: Box::new(error),
                        context: context.path().clone(),
                    };
                    log::warn!("{argument_error}");
                })
                .unwrap_or(false)
        })
    }
}

impl<'a> QueryArgument {
    const DEFAULT_INSPECTED_VALUE: Cow<'static, Value> = Cow::Owned(Value::Null);

    fn satisfies(&'a self, value: &Value, context: &Context<'a>) -> Result<bool, Error<'a>> {
        let argument_key = self.key();

        let inspected_value = match argument_key.inspect(value, context) {
            Ok(value) => value,
            // TODO: only return null value for the KeyNotFound error?
            // TODO: the query inspection should not use InternalError, it is too generic
            Err(error @ InternalError::KeyNotFound(_)) => {
                log::info!("{error}, using null value");
                Self::DEFAULT_INSPECTED_VALUE
            }
            Err(error) => return Err(error.into()),
        };

        let inspected_context = context.push_query_key(argument_key);
        self.operation
            .satisfies(&inspected_value, &inspected_context)
    }
}
