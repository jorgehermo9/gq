use axum::{
    extract::Path,
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
struct CreateShare {
    json: String,
    query: String,
}

#[derive(Serialize)]
struct CreatedShare {
    id: Uuid,
}

async fn create_share(Json(payload): Json<CreateShare>) -> impl IntoResponse {
    let uuid = Uuid::now_v7();
    let mut headers = HeaderMap::new();
    headers.insert("Location", format!("/shares/{uuid}").parse().unwrap());

    let created = CreatedShare { id: uuid };

    (StatusCode::CREATED, headers, Json(created))
}

#[derive(Serialize)]
struct Share {
    id: Uuid,
    json: String,
    query: String,
}

async fn get_share(Path(id): Path<Uuid>) -> Json<Share> {
    Json(Share {
        id,
        json: "json".to_string(),
        query: "query".to_string(),
    })
}

pub fn router() -> axum::Router {
    axum::Router::new()
        .route("/", post(create_share))
        .route("/:id", get(get_share))
}
