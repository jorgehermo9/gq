use crate::dtos::share_dto::ShareDTO;
use crate::routes;
use crate::services::share::GetShareError;
use crate::{
    dtos::error_object::ErrorObject,
    services::share::{CreateShareError, ShareService},
    AppState,
};
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub const SHARES_CONTEXT: &str = "/shares";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateShareRequest {
    json: String,
    query: String,
    expiration_time_secs: i64,
}

impl From<CreateShareError> for ErrorObject {
    fn from(error: CreateShareError) -> Self {
        match error {
            CreateShareError::InvalidExpirationTime { .. } => {
                ErrorObject::new(error.to_string(), StatusCode::BAD_REQUEST)
            }
            CreateShareError::DatabaseError(_) => ErrorObject::new_internal_error(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CreateShareResponse {
    id: Uuid,
}

async fn create_share(
    State(share_service): State<ShareService>,
    Json(request): Json<CreateShareRequest>,
) -> impl IntoResponse {
    let create_result = share_service
        .create_share(request.json, request.query, request.expiration_time_secs)
        .await;

    let share_id = match create_result {
        Ok(share_id) => share_id,
        Err(create_share_error) => {
            return routes::build_error_response!(create_share_error);
        }
    };

    let mut headers = HeaderMap::new();
    headers.insert(
        "Location",
        format!("{SHARES_CONTEXT}/{share_id}").parse().unwrap(),
    );

    let create_share_response = CreateShareResponse { id: share_id };

    (StatusCode::CREATED, headers, Json(create_share_response)).into_response()
}

impl From<GetShareError> for ErrorObject {
    fn from(error: GetShareError) -> Self {
        match error {
            GetShareError::DatabaseError(_) => ErrorObject::new_internal_error(),
            GetShareError::ShareNotFound(_) => {
                ErrorObject::new(error.to_string(), StatusCode::NOT_FOUND)
            }
        }
    }
}

async fn get_share(
    State(share_service): State<ShareService>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let get_share_result = share_service.get_share(id).await;

    match get_share_result {
        Ok(share) => {
            let share_dto = ShareDTO::from(share);
            Json(share_dto).into_response()
        }
        Err(get_share_error) => routes::build_error_response!(get_share_error),
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", post(create_share))
        .route("/:id", get(get_share))
}
