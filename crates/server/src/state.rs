use axum::extract::FromRef;
use sqlx::PgPool;

use crate::services::shares::SharesService;

#[derive(Clone)]
pub struct AppState {
    shares_service: SharesService,
}

impl AppState {
    pub fn new(db: PgPool) -> Self {
        let shares_service = SharesService::new(db);
        Self { shares_service }
    }
}

impl FromRef<AppState> for SharesService {
    fn from_ref(state: &AppState) -> Self {
        state.shares_service.clone()
    }
}
