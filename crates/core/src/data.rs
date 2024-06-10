use crate::format::Indentation;
use derive_getters::Getters;
use derive_more::Display;
use serde_json::Value;
use std::borrow::Cow;
use thiserror::Error;

pub mod format;

#[derive(Debug, Error)]
pub enum Error {
    #[error("json parsing error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("yaml parsing error: {0}")]
    Yaml(#[from] serde_yaml::Error),
    #[error("format error: {0}")]
    Format(#[from] format::Error),
}

#[derive(Debug, Copy, Clone, Hash, PartialEq, Eq, Display)]
pub enum DataType {
    Json,
    Yaml,
}

// TODO: implement Hash, partialEq and Eq with an id field, so string comparition is cheap
#[derive(Debug, Getters, Clone, Hash, PartialEq, Eq)]
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
    pub fn pretty_convert_to(
        &self,
        target_type: DataType,
        indentation: Indentation,
    ) -> Result<Data, Error> {
        let value = Value::try_from(self)?;
        let payload = target_type.pretty_format(&value, indentation)?;
        let data = Self {
            payload: Cow::Owned(payload),
            data_type: target_type,
        };
        Ok(data)
    }

    pub fn pretty_format(&'a self, indentation: Indentation) -> Result<Self, Error> {
        let value = Value::try_from(self)?;
        let payload = self.data_type.pretty_format(&value, indentation)?;
        Ok(Self {
            payload: Cow::Owned(payload),
            data_type: self.data_type,
        })
    }

    pub fn into_inner(self) -> Cow<'a, str> {
        self.payload
    }

    pub fn into_owned(self) -> Data<'static> {
        Data {
            payload: Cow::Owned(self.payload.into_owned()),
            data_type: self.data_type,
        }
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
}

impl TryFrom<&Data<'_>> for Value {
    type Error = Error;

    fn try_from(data: &Data) -> Result<Self, Self::Error> {
        data.data_type.value_from_str(&data.payload)
    }
}
