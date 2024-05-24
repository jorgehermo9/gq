use serde_json::Value;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("json parsing error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("yaml parsing error: {0}")]
    Yaml(#[from] serde_yaml::Error),
}

#[derive(Debug, PartialEq, Eq)]
pub enum ValueType {
    Json,
    Yaml,
}

impl ValueType {
    pub fn value_from_str(&self, data: &str) -> Result<Value, Error> {
        let result = match self {
            ValueType::Json => serde_json::from_str(data)?,
            ValueType::Yaml => serde_yaml::from_str(data)?,
        };
        Ok(result)
    }

    pub fn value_to_string(&self, value: &Value) -> Result<String, Error> {
        let result = match self {
            ValueType::Json => serde_json::to_string(value)?,
            ValueType::Yaml => serde_yaml::to_string(value)?,
        };
        Ok(result)
    }

    pub fn convert_to(&self, data: &str, target_type: &Self) -> Result<String, Error> {
        if self == target_type {
            return Ok(data.to_string());
        }
        let value = self.value_from_str(data)?;
        target_type.value_to_string(&value)
    }

    pub fn pretty_format(&self, value: &Value, indent: usize) -> Result<String, Error> {
        let result = match self {
            ValueType::Json => {
                if indent == 0 {
                    value.to_string()
                } else {
                    serde_json::to_string_pretty(value)?
                }
            }
            ValueType::Yaml => serde_yaml::to_string(&value)?,
        };
        Ok(result)
    }
}
