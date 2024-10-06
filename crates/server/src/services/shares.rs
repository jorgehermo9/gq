use sqlx::PgPool;
use uuid::Uuid;

use crate::model::share::Share;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),
}

#[derive(Clone)]
pub struct SharesService {
    pub db_connection: PgPool,
}

impl SharesService {
    pub fn new(db_connection: PgPool) -> Self {
        Self { db_connection }
    }

    pub async fn create_share(&self, json: String, query: String) -> Result<Uuid, Error> {
        let uuid = Uuid::now_v7();
        let _ = sqlx::query!(
            "INSERT INTO share (id, json, query) VALUES ($1, $2, $3)",
            uuid,
            json,
            query
        )
        .execute(&self.db_connection)
        .await?;
        Ok(uuid)
    }

    pub async fn get_share(&self, id: Uuid) -> Result<Share, Error> {
        let share = sqlx::query_as!(Share, "SELECT * FROM share WHERE id = $1", id)
            .fetch_one(&self.db_connection)
            .await?;
        Ok(share)
    }
}
