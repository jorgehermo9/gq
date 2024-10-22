use apalis::prelude::{Data, Job};
use chrono::{DateTime, Utc};
use sqlx::PgPool;

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

pub async fn execute_cleanup(task: CleanupTask, db_connection: Data<PgPool>) {
    let rfc3339_start_time = task.start_time.to_rfc3339();
    tracing::info!(start_time = rfc3339_start_time, "Executing cleanup task");
}
