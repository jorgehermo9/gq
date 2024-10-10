use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Share {
    pub id: Uuid,
    pub json: String,
    pub query: String,
    pub expires_at: DateTime<Utc>,
}
