use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{model::share::Share, services::share::ShareService, AppState};

pub const SHARES_CONTEXT: &str = "/shares";

#[derive(Deserialize)]
struct CreateShareRequest {
    json: String,
    query: String,
}

async fn create_share(
    State(shares_service): State<ShareService>,
    Json(request): Json<CreateShareRequest>,
) -> impl IntoResponse {
    let share_id = shares_service
        .create_share(request.json, request.query)
        .await
        // TODO: handle unwrap. Log the error and return a 500 without giving away too much info
        // we should return a Error Object with a trace id to trace the error in the logs
        .unwrap();
    let mut headers = HeaderMap::new();
    headers.insert(
        "Location",
        format!("{SHARES_CONTEXT}/{share_id}").parse().unwrap(),
    );

    (StatusCode::CREATED, headers)
}

async fn get_share(
    State(shares_service): State<ShareService>,
    Path(id): Path<Uuid>,
) -> Json<Share> {
    // TODO: handle unwrap. Log the error and return a 500 without giving away too much info
    // we should return a Error Object with a trace id to trace the error in the logs
    let share = shares_service.get_share(id).await.unwrap();
    Json(share)
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", post(create_share))
        .route("/:id", get(get_share))
}
