use std::fmt::{self, Display, Formatter};

use super::{apply::InternalError, context::Context, QueryKey};
use derive_getters::Getters;
use derive_more::Constructor;
use serde_json::Value;

#[derive(Debug, Clone, derive_more::Display)]
pub enum QueryArgumentValue<'a> {
    String(&'a str),
    Number(f64),
    Bool(bool),
    Null,
}

#[derive(Debug, Clone)]
pub enum QueryArgumentOperator {
    Equal,
    NotEqual,
    Greater,
    GreaterEqual,
    Less,
    LessEqual,
    Regex,
    NotRegex,
}

impl Display for QueryArgumentOperator {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            QueryArgumentOperator::Equal => "=",
            QueryArgumentOperator::NotEqual => "!=",
            QueryArgumentOperator::Greater => ">",
            QueryArgumentOperator::GreaterEqual => ">=",
            QueryArgumentOperator::Less => "<",
            QueryArgumentOperator::LessEqual => "<=",
            QueryArgumentOperator::Regex => "~",
            QueryArgumentOperator::NotRegex => "!~",
        }
        .fmt(f)
    }
}

#[derive(Debug, Clone, Constructor, Getters)]
pub struct QueryArgument<'a> {
    key: QueryKey<'a>,
    operator: QueryArgumentOperator,
    value: QueryArgumentValue<'a>,
}

impl Display for QueryArgument<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let key = self.key().to_string();
        let value = match self.value() {
            QueryArgumentValue::String(value) => format!("\"{value}\""),
            QueryArgumentValue::Number(value) => value.to_string(),
            QueryArgumentValue::Bool(value) => value.to_string(),
            QueryArgumentValue::Null => "null".to_string(),
        };
        write!(f, "{key}={value}")
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
    pub fn filter(
        &'a self,
        value: &Value,
        argument_context: &Context<'a>,
        context: &Context<'a>,
    ) -> bool {
        self.0.iter().all(|argument| {
            argument
                .filter(value, argument_context)
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
    fn filter(&'a self, value: &Value, context: &Context<'a>) -> Result<bool, InternalError<'a>> {
        let argument_key = self.key();
        let argument_value = self.value();
        let inspected_value = argument_key.inspect(value, context)?;
        Self::fulfill_argument(&inspected_value, argument_value)
    }

    //TODO: improve naming
    fn fulfill_argument(
        value: &Value,
        argument_value: &QueryArgumentValue,
    ) -> Result<bool, InternalError<'a>> {
        let fulfill = match (value, argument_value) {
            (Value::String(value), QueryArgumentValue::String(argument_value)) => {
                value == argument_value
            }
            (Value::Number(value), QueryArgumentValue::Number(argument_value)) => {
                // TODO: improve this conversion
                value
                    .as_f64()
                    .expect("TODO: improve number value conversion")
                    == *argument_value
            }
            (Value::Bool(value), QueryArgumentValue::Bool(argument_value)) => {
                value == argument_value
            }
            (Value::Null, QueryArgumentValue::Null) => true,
            (Value::Array(array), argument_value) => array.iter().any(|item| {
                // TODO: when an error occurs here, we should log a warn and return false
                Self::fulfill_argument(item, argument_value).expect("TODO: handle this error")
            }),
            (value, argument_value) => {
                // TODO: do some error handling here reporting the incompatible types. We should raise an error ere
                log::warn!(
                    "TODO: handle incompatible types error '{value}' and '{argument_value}'"
                );
                false
            }
        };
        Ok(fulfill)
    }
}
