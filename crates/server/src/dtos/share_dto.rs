use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::model::share::Share;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShareDTO {
    pub id: Uuid,
    pub json: String,
    pub query: String,
}

impl From<Share> for ShareDTO {
    fn from(share: Share) -> Self {
        Self {
            id: share.id,
            json: share.json,
            query: share.query,
        }
    }
}
