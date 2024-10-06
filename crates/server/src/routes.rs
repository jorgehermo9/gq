use axum::Router;

use crate::AppState;

mod shares;

pub fn router(app_state: AppState) -> Router {
    Router::new()
        .nest(shares::SHARES_CONTEXT, shares::router())
        .with_state(app_state)
}
