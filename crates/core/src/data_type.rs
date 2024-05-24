use crate::format::{self, Indentation, PrettyFormat};
use serde_json::Value;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("json parsing error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("yaml parsing error: {0}")]
    Yaml(#[from] serde_yaml::Error),

    #[error("format error: {0}")]
    Format(#[from] format::Error),
}

#[derive(Debug)]
pub enum DataType {
    Json,
    Yaml,
}

impl DataType {
    pub fn value_from_str(&self, data: &str) -> Result<Value, Error> {
        let result = match self {
            DataType::Json => serde_json::from_str(data)?,
            DataType::Yaml => serde_yaml::from_str(data)?,
        };
        Ok(result)
    }

    pub fn value_to_string(&self, value: &Value) -> Result<String, Error> {
        let result = match self {
            DataType::Json => serde_json::to_string(value)?,
            DataType::Yaml => serde_yaml::to_string(value)?,
        };
        Ok(result)
    }

    pub fn convert_to(&self, data: &str, target_type: &Self) -> Result<String, Error> {
        let value = self.value_from_str(data)?;
        target_type.value_to_string(&value)
    }

    pub fn pretty_convert_to(
        &self,
        data: &str,
        target_type: &Self,
        indentation: &Indentation,
    ) -> Result<String, Error> {
        let value = self.value_from_str(data)?;
        target_type.pretty_format(&value, indentation)
    }

    pub fn pretty_format(&self, value: &Value, indentation: &Indentation) -> Result<String, Error> {
        let result = match self {
            DataType::Json => value.pretty_format(indentation)?,
            DataType::Yaml => serde_yaml::to_string(&value)?,
        };
        Ok(result)
    }
}
