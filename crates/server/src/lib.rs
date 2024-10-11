use axum::Router;
use sqlx::PgPool;
use state::AppState;

pub mod dtos;
pub mod model;
pub mod routes;
pub mod services;
pub mod state;

pub fn app(db_connection: PgPool, max_share_expiration_time_secs: i64) -> Router {
    let app_state = AppState::new(db_connection, max_share_expiration_time_secs);
    routes::router(app_state)
}
