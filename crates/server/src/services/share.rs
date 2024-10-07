use chrono::{Duration, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::model::share::Share;

#[derive(Debug, thiserror::Error)]
pub enum GetShareError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),
}

#[derive(Debug, thiserror::Error)]
pub enum CreateShareError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),
    #[error(
        "Invalid expiration time: {actual} seconds. Must be greater than 0 and less than {max} seconds"
    )]
    InvalidExpirationTime { actual: i64, max: i64 },
}

#[derive(Clone)]
pub struct ShareService {
    pub db_connection: PgPool,
    pub max_expiration_time_secs: i64,
}

impl ShareService {
    pub fn new(db_connection: PgPool, max_expiration_time_secs: i64) -> Self {
        Self {
            db_connection,
            max_expiration_time_secs,
        }
    }

    pub async fn create_share(
        &self,
        json: String,
        query: String,
        expiration_time_secs: i64,
    ) -> Result<Uuid, CreateShareError> {
        if expiration_time_secs <= 0 || expiration_time_secs > self.max_expiration_time_secs {
            return Err(CreateShareError::InvalidExpirationTime {
                actual: expiration_time_secs,
                max: self.max_expiration_time_secs,
            });
        }

        let uuid = Uuid::now_v7();
        let now = Utc::now();
        let expires_at = now + Duration::seconds(expiration_time_secs);

        let _ = sqlx::query!(
            "INSERT INTO share (id, json, query, expires_at) VALUES ($1, $2, $3, $4)",
            uuid,
            json,
            query,
            expires_at
        )
        .execute(&self.db_connection)
        .await?;
        Ok(uuid)
    }

    pub async fn get_share(&self, id: Uuid) -> Result<Option<Share>, GetShareError> {
        let share = sqlx::query_as!(Share, "SELECT * FROM share WHERE id = $1", id)
            .fetch_optional(&self.db_connection)
            .await?;

        let now = Utc::now();
        // TODO: should we silently filter out expired shares? or should we return
        // a custom success enum to represent this, so a 410 Gone can be returned
        // to the client instead of a 404
        let share = share.filter(|share| share.expires_at >= now);

        Ok(share)
    }
}
