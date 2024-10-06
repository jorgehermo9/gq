use axum::Router;
use sqlx::PgPool;
use state::AppState;

pub mod model;
pub mod routes;
pub mod services;
pub mod state;

pub fn app(db_connection: PgPool) -> Router {
    let app_state = AppState::new(db_connection);
    routes::router(app_state)
}
