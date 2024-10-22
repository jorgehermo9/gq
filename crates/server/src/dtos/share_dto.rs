use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::model::share::{DataType, Share};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShareDTO {
    pub id: Uuid,
    pub input_data: String,
    pub input_type: DataTypeDTO,
    pub output_type: DataTypeDTO,
    pub query: String,
}

impl From<Share> for ShareDTO {
    fn from(share: Share) -> Self {
        Self {
            id: share.id,
            input_data: share.input_data,
            input_type: share.input_type.into(),
            output_type: share.output_type.into(),
            query: share.query,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DataTypeDTO {
    Json,
    Yaml,
}

impl From<DataType> for DataTypeDTO {
    fn from(data_type: DataType) -> Self {
        match data_type {
            DataType::Json => Self::Json,
            DataType::Yaml => Self::Yaml,
        }
    }
}

impl From<DataTypeDTO> for DataType {
    fn from(data_type: DataTypeDTO) -> Self {
        match data_type {
            DataTypeDTO::Json => Self::Json,
            DataTypeDTO::Yaml => Self::Yaml,
        }
    }
}
