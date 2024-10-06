use axum::extract::FromRef;
use sqlx::PgPool;

use crate::services::share::ShareService;

#[derive(Clone)]
pub struct AppState {
    shares_service: ShareService,
}

impl AppState {
    pub fn new(db: PgPool) -> Self {
        let shares_service = ShareService::new(db);
        Self { shares_service }
    }
}

impl FromRef<AppState> for ShareService {
    fn from_ref(state: &AppState) -> Self {
        state.shares_service.clone()
    }
}
