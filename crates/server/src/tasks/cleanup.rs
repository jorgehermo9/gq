use apalis::prelude::{Data, Job};
use chrono::{DateTime, SecondsFormat, Utc};
use lazy_static::lazy_static;
use sqlx::PgPool;
use tokio::sync::Mutex;

lazy_static! {
    static ref CLEANUP_TASK_LOCK: Mutex<()> = Mutex::new(());
}

#[derive(Default, Debug, Clone)]
pub struct CleanupTask {
    start_time: DateTime<Utc>,
}

impl From<DateTime<Utc>> for CleanupTask {
    fn from(start_time: DateTime<Utc>) -> Self {
        CleanupTask { start_time }
    }
}

impl Job for CleanupTask {
    const NAME: &'static str = "CleanupTask";
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Cleanup task was already running. Skipped execution with timestamp {timestamp}")]
    AlreadyRunning { timestamp: String },
}

impl CleanupTask {
    async fn cleanup(&self, db_connection: Data<PgPool>) -> Result<u64, Error> {
        let rfc3339_start_time = self.start_time.to_rfc3339_opts(SecondsFormat::Millis, true);

        let Ok(_lock) = CLEANUP_TASK_LOCK.try_lock() else {
            return Err(Error::AlreadyRunning {
                timestamp: rfc3339_start_time,
            });
        };

        tracing::info!(timestamp = rfc3339_start_time, "Executing cleanup task");

        let result = sqlx::query!(
            r#"
            DELETE FROM share
            WHERE expires_at <= $1
            "#,
            self.start_time
        )
        .execute(&*db_connection)
        .await?;

        Ok(result.rows_affected())
    }
}

pub async fn execute_cleanup(task: CleanupTask, db_connection: Data<PgPool>) -> Result<(), Error> {
    match task.cleanup(db_connection).await {
        Ok(rows_affected) => {
            tracing::info!(deleted_shares = rows_affected, "Cleanup task completed",);
            Ok(())
        }
        Err(e) => {
            tracing::error!(reason = %e,"Error executing cleanup task");
            match e {
                // Do not retry if the task is already running
                Error::AlreadyRunning { .. } => Ok(()),
                _ => Err(e),
            }
        }
    }
}
