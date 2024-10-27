use app_state::AppState;
use axum::Router;
use sqlx::PgPool;

pub mod api;
pub mod app_state;
pub mod model;
pub mod services;

pub fn app(db_connection: PgPool, max_share_expiration_time_secs: i64) -> Router {
    let app_state = AppState::new(db_connection, max_share_expiration_time_secs);
    api::routes::router(app_state)
}
