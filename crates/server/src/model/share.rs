use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Share {
    pub id: Uuid,
    pub input_data: String,
    pub input_type: DataType,
    pub output_type: DataType,
    pub query: String,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "data_type", rename_all = "lowercase")]
pub enum DataType {
    Json,
    Yaml,
}
