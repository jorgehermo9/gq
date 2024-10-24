use chrono::{Duration, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::model::share::{DataType, Share};

#[derive(Debug, thiserror::Error)]
pub enum GetShareError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),
    #[error("Share {0} not found")]
    ShareNotFound(Uuid),
}

#[derive(Debug, thiserror::Error)]
pub enum CreateShareError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),
    #[error(
        "Invalid expiration time: {actual} seconds. Must be greater than 0 and less than {max}"
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
        input_data: String,
        input_type: DataType,
        output_type: DataType,
        query: String,
        expiration_time_secs: i64,
    ) -> Result<Uuid, CreateShareError> {
        // TODO: accept a CreateShare as input and validate it with a validate_create_response internal
        // function to split the validation logic
        if expiration_time_secs <= 0 || expiration_time_secs > self.max_expiration_time_secs {
            return Err(CreateShareError::InvalidExpirationTime {
                actual: expiration_time_secs,
                max: self.max_expiration_time_secs,
            });
        }

        let uuid = Uuid::now_v7();
        let now = Utc::now();
        let expires_at = now + Duration::seconds(expiration_time_secs);

        sqlx::query!(
            "INSERT INTO share
            (id, input_data, input_type, output_type, query, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)",
            uuid,
            input_data,
            input_type as DataType,
            output_type as DataType,
            query,
            expires_at
        )
        .execute(&self.db_connection)
        .await?;

        Ok(uuid)
    }

    pub async fn get_share(&self, id: Uuid) -> Result<Share, GetShareError> {
        // See https://docs.rs/sqlx/0.4.2/sqlx/macro.query.html#force-a-differentcustom-type
        // and https://github.com/launchbadge/sqlx/issues/1004#issuecomment-764921020 for
        // more information about the custom type syntax
        let share = sqlx::query_as!(
            Share,
            r#"SELECT id, input_data, input_type as "input_type: DataType",
            output_type as "output_type: DataType", query, expires_at
            FROM share WHERE id = $1"#,
            id
        )
        .fetch_optional(&self.db_connection)
        .await?;

        let now = Utc::now();
        let share = share.filter(|share| share.expires_at >= now);
        share.ok_or_else(|| GetShareError::ShareNotFound(id))
    }
}
