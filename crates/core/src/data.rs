use std::borrow::Cow;

use crate::format::{self, Indentation, PrettyFormat};
use derive_getters::Getters;
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

#[derive(Debug, Copy, Clone)]
pub enum DataType {
    Json,
    Yaml,
}

#[derive(Debug, Getters)]
pub struct Data<'a> {
    payload: Cow<'a, str>,
    data_type: DataType,
}

impl<'a> Data<'a> {
    pub fn json(data: Cow<'a, str>) -> Self {
        Self {
            payload: data,
            data_type: DataType::Json,
        }
    }

    pub fn yaml(data: Cow<'a, str>) -> Self {
        Self {
            payload: data,
            data_type: DataType::Yaml,
        }
    }

    pub fn from_value(value: &Value, data_type: DataType) -> Result<Self, Error> {
        let payload = data_type.value_to_string(value)?;
        Ok(Self {
            payload: Cow::Owned(payload),
            data_type,
        })
    }

    pub fn pretty_from_value(
        value: &Value,
        data_type: DataType,
        indentation: Indentation,
    ) -> Result<Self, Error> {
        let payload = data_type.pretty_format(value, indentation)?;
        Ok(Self {
            payload: Cow::Owned(payload),
            data_type,
        })
    }

    // TODO: replace this method by From<Data> for Value...
    pub fn value(&self) -> Result<Value, Error> {
        self.data_type.value_from_str(&self.payload)
    }

    pub fn convert_to(&self, target_type: DataType) -> Result<Data, Error> {
        let value = self.value()?;
        let payload = target_type.value_to_string(&value)?;
        let data = Self {
            payload: Cow::Owned(payload),
            data_type: target_type,
        };
        Ok(data)
    }

    pub fn pretty_convert_to(
        &self,
        target_type: DataType,
        indentation: Indentation,
    ) -> Result<Data, Error> {
        let value = self.value()?;
        let payload = target_type.pretty_format(&value, indentation)?;
        let data = Self {
            payload: Cow::Owned(payload),
            data_type: target_type,
        };
        Ok(data)
    }

    pub fn pretty_format(&'a self, indentation: Indentation) -> Result<Self, Error> {
        self.pretty_convert_to(self.data_type, indentation)
    }

    pub fn into_inner(self) -> Cow<'a, str> {
        self.payload
    }
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

    pub fn pretty_format(&self, value: &Value, indentation: Indentation) -> Result<String, Error> {
        let result = match self {
            DataType::Json => value.pretty_format(indentation)?,
            // TODO: implement pretty format for yaml
            DataType::Yaml => serde_yaml::to_string(value)?,
        };
        Ok(result)
    }
}
