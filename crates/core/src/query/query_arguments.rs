use std::fmt::{self, Display, Formatter};

use super::{apply::InternalError, context::Context, OwnedJsonPath, QueryKey};
use derive_getters::Getters;
use derive_more::Constructor;
use regex::Regex;
use serde_json::{Number, Value};
use thiserror::Error;

#[derive(Debug, Clone, Error)]
pub enum Error {
    // TODO: improve this error. We should report the QueryArgumentValue and the QueryArgumentOperation
    #[error("types '{value_type}' and '{argument_value_type}' are incompatible in '{operation_type}' operation at {path}")]
    IncompatibleTypes {
        value_type: String,
        argument_value_type: String,
        operation_type: String,
        // TODO: maybe converting from JsonPath to OwnedJsonPath is expensive
        path: OwnedJsonPath,
    },
    #[error("cannot conver number '{0}' to f64 at {1}")]
    // TODO: maybe converting from JsonPath to OwnedJsonPath is expensive
    NumberConversionError(Number, OwnedJsonPath),
}

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

impl ValueType for QueryArgumentValue<'_> {
    fn value_type(&self) -> String {
        match self {
            QueryArgumentValue::String(_) => "string".to_string(),
            QueryArgumentValue::Number(_) => "number".to_string(),
            QueryArgumentValue::Bool(_) => "bool".to_string(),
            QueryArgumentValue::Null => "null".to_string(),
        }
    }
}

impl ValueType for f64 {
    fn value_type(&self) -> String {
        "number".to_string()
    }
}

impl ValueType for Regex {
    fn value_type(&self) -> String {
        "regex".to_string()
    }
}

pub trait OperationType {
    fn operation_type(&self) -> String;
}

impl OperationType for QueryArgumentOperation<'_> {
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

#[derive(Debug, Clone)]
pub enum QueryArgumentValue<'a> {
    String(&'a str),
    Number(f64),
    Bool(bool),
    Null,
}

impl Display for QueryArgumentValue<'_> {
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
pub enum QueryArgumentOperation<'a> {
    Equal(QueryArgumentValue<'a>),
    NotEqual(QueryArgumentValue<'a>),
    Greater(f64),
    GreaterEqual(f64),
    Less(f64),
    LessEqual(f64),
    Match(Regex),
    NotMatch(Regex),
}

impl Display for QueryArgumentOperation<'_> {
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

impl QueryArgumentOperation<'_> {
    fn satisfies(&self, value: &Value, context: &Context) -> Result<bool, Error> {
        match self {
            QueryArgumentOperation::Equal(argument_value) => {
                self.satisfies_equal(argument_value, value, context)
            }
            QueryArgumentOperation::NotEqual(argument_value) => self
                .satisfies_equal(argument_value, value, context)
                .map(|result| !result),
            QueryArgumentOperation::Greater(argument_value) => {
                self.satisfies_greater(*argument_value, value, context)
            }
            QueryArgumentOperation::GreaterEqual(argument_value) => self
                .satisfies_less(*argument_value, value, context)
                .map(|result| !result),
            QueryArgumentOperation::Less(argument_value) => {
                self.satisfies_less(*argument_value, value, context)
            }
            QueryArgumentOperation::LessEqual(argument_value) => self
                .satisfies_greater(*argument_value, value, context)
                .map(|result| !result),
            QueryArgumentOperation::Match(argument_value) => {
                self.satisfies_match(argument_value, value, context)
            }
            QueryArgumentOperation::NotMatch(argument_value) => self
                .satisfies_match(argument_value, value, context)
                .map(|result| !result),
        }
    }

    // TODO: maybe this is not the best way to do it @David pasa por el aro
    // this is a ñapa
    fn satisfies_op_array<F>(array: &[Value], satisfies_op: F, context: &Context) -> bool
    where
        F: Fn(&Value, &Context) -> Result<bool, Error>,
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
        // TODO: this method should have a self parameter?
        &self,
        argument_value: &QueryArgumentValue,
        value: &Value,
        context: &Context,
    ) -> Result<bool, Error> {
        match (argument_value, value) {
            (QueryArgumentValue::String(argument_value), Value::String(value)) => {
                Ok(argument_value == value)
            }
            (QueryArgumentValue::Number(argument_value), Value::Number(value)) => {
                value
                    .as_f64()
                    .map(|value| value == *argument_value)
                    // TODO: improve number value conversion\
                    .ok_or(Error::NumberConversionError(
                        value.clone(),
                        OwnedJsonPath::from(context.path()),
                    ))
            }
            (QueryArgumentValue::Bool(argument_value), Value::Bool(value)) => {
                Ok(argument_value == value)
            }
            (QueryArgumentValue::Null, Value::Null) => Ok(true),
            (_, Value::Array(array)) => {
                let satisfies_op = |item: &Value, context: &Context| -> Result<bool, Error> {
                    self.satisfies_equal(argument_value, item, context)
                };
                Ok(Self::satisfies_op_array(array, satisfies_op, context))
            }
            _ => Err(self.incompatible_types_error(argument_value, value, context)),
        }
    }
    fn satisfies_greater(
        &self,
        argument_value: f64,
        value: &Value,
        context: &Context,
    ) -> Result<bool, Error> {
        match value {
            Value::Number(value) => value.as_f64().map(|value| value > argument_value).ok_or(
                Error::NumberConversionError(value.clone(), OwnedJsonPath::from(context.path())),
            ),
            Value::Array(array) => {
                let satisfies_op = |item: &Value, context: &Context| -> Result<bool, Error> {
                    self.satisfies_greater(argument_value, item, context)
                };
                Ok(Self::satisfies_op_array(array, satisfies_op, context))
            }
            _ => Err(self.incompatible_types_error(&argument_value, value, context)),
        }
    }

    fn satisfies_less(
        &self,
        argument_value: f64,
        value: &Value,
        context: &Context,
    ) -> Result<bool, Error> {
        match value {
            Value::Number(value) => value.as_f64().map(|value| value < argument_value).ok_or(
                Error::NumberConversionError(value.clone(), OwnedJsonPath::from(context.path())),
            ),
            Value::Array(array) => {
                let satisfies_op = |item: &Value, context: &Context| -> Result<bool, Error> {
                    self.satisfies_less(argument_value, item, context)
                };
                Ok(Self::satisfies_op_array(array, satisfies_op, context))
            }
            _ => Err(self.incompatible_types_error(&argument_value, value, context)),
        }
    }

    fn satisfies_match(
        &self,
        argument_value: &Regex,
        value: &Value,
        context: &Context,
    ) -> Result<bool, Error> {
        match value {
            Value::String(value) => Ok(argument_value.is_match(value)),
            Value::Array(array) => {
                let satisfies_op = |item: &Value, context: &Context| -> Result<bool, Error> {
                    self.satisfies_match(argument_value, item, context)
                };
                Ok(Self::satisfies_op_array(array, satisfies_op, context))
            }
            _ => Err(self.incompatible_types_error(argument_value, value, context)),
        }
    }

    fn incompatible_types_error<T: ValueType, U: ValueType>(
        &self,
        argument_value: &T,
        value: &U,
        context: &Context,
    ) -> Error {
        let value_type = value.value_type();
        let argument_value_type = argument_value.value_type();
        let operation_type = self.operation_type();
        Error::IncompatibleTypes {
            value_type,
            argument_value_type,
            operation_type,
            path: OwnedJsonPath::from(context.path()),
        }
    }
}

#[derive(Debug, Clone, Constructor, Getters)]
pub struct QueryArgument<'a> {
    key: QueryKey<'a>,
    operation: QueryArgumentOperation<'a>,
}

impl Display for QueryArgument<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let key = self.key();
        let operation = self.operation();
        write!(f, "{key}{operation}")
    }
}

#[derive(Debug, Clone, Constructor, Default)]
pub struct QueryArguments<'a>(pub Vec<QueryArgument<'a>>);

impl Display for QueryArguments<'_> {
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

// TODO: maybe we should move this to the query_argument module
impl<'a> QueryArguments<'a> {
    //TODO: improve method naming
    //TODO: maybe parent_context is not necessary, think better about the errors
    pub fn satisfies(&'a self, value: &Value, context: &Context<'a>) -> bool {
        self.0.iter().all(|argument| {
            argument
                .satisfies(value, context)
                .map_err(|error| {
                    let argument_error =
                        InternalError::InsideArguments(Box::new(error), context.path().clone());
                    log::warn!("{argument_error}");
                })
                .unwrap_or(false)
        })
    }
}

impl<'a> QueryArgument<'a> {
    fn satisfies(
        &'a self,
        value: &Value,
        context: &Context<'a>,
    ) -> Result<bool, InternalError<'a>> {
        let argument_key = self.key();
        // The inspect does clone the inspected value and it may be very inefficient.
        // Although, it should be a primitive value cloning (or an array of primitive values)
        let inspected_value = argument_key.inspect(value, context)?;
        let inspected_context = context.push_query_key(argument_key);

        self.operation
            .satisfies(&inspected_value, &inspected_context)
            .map_err(InternalError::from)
    }
}
