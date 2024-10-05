use axum::Router;

mod shares;

pub fn router() -> Router {
    Router::new().nest_service("/shares", shares::router())
}
