use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use uuid::Uuid;

use crate::{
    dto::error_object::ErrorObject,
    services::share::{CreateShareError, ShareService},
    AppState,
};

pub const SHARES_CONTEXT: &str = "/shares";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateShareRequest {
    json: String,
    query: String,
    expiration_time_secs: i64,
}

impl From<&CreateShareError> for ErrorObject {
    fn from(error: &CreateShareError) -> Self {
        match error {
            CreateShareError::InvalidExpirationTime { .. } => {
                ErrorObject::new(error.to_string(), StatusCode::BAD_REQUEST)
            }
            CreateShareError::DatabaseError(_) => ErrorObject::new(
                "Database error".to_string(),
                StatusCode::INTERNAL_SERVER_ERROR,
            ),
        }
    }
}

async fn create_share(
    State(shares_service): State<ShareService>,
    Json(request): Json<CreateShareRequest>,
) -> impl IntoResponse {
    let create_result = shares_service
        .create_share(request.json, request.query, request.expiration_time_secs)
        .await;

    let share_id = match create_result {
        Ok(share_id) => share_id,
        Err(error) => {
            let error_object = ErrorObject::from(&error);
            // TODO: improve this
            tracing::error!(
                "Returning error response with trace id: {}. Original error: {error}",
                error_object.trace_id
            );
            return error_object.into_response();
        }
    };

    let mut headers = HeaderMap::new();
    headers.insert(
        "Location",
        format!("{SHARES_CONTEXT}/{share_id}").parse().unwrap(),
    );

    (StatusCode::CREATED, headers).into_response()
}

async fn get_share(
    State(shares_service): State<ShareService>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    // TODO: handle unwrap. Log the error and return a 500 without giving away too much info
    // we should return a Error Object with a trace id to trace the error in the logs
    let share = shares_service.get_share(id).await.unwrap();
    // TODO: create a ShareDTO and return it
    match share {
        Some(share) => Json(share).into_response(),
        None => (StatusCode::NOT_FOUND).into_response(),
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", post(create_share))
        .route("/:id", get(get_share))
}
