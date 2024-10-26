use axum::extract::FromRef;
use sqlx::PgPool;

use crate::services::share::ShareService;

#[derive(Clone)]
pub struct AppState {
    share_service: ShareService,
}

impl AppState {
    pub fn new(db: PgPool, max_share_expiration_time_secs: i64) -> Self {
        let share_service = ShareService::new(db, max_share_expiration_time_secs);
        Self { share_service }
    }
}

impl FromRef<AppState> for ShareService {
    fn from_ref(state: &AppState) -> Self {
        state.share_service.clone()
    }
}
