use axum::{http::StatusCode, response::IntoResponse, Json};
use chrono::{DateTime, Utc};
use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct ErrorObject {
    pub message: String,
    #[serde(with = "http_serde::status_code")]
    pub code: StatusCode,
    pub timestamp: DateTime<Utc>,
    pub trace_id: Uuid,
}

impl ErrorObject {
    pub fn new(message: String, code: StatusCode) -> Self {
        Self {
            message,
            code,
            timestamp: Utc::now(),
            trace_id: Uuid::now_v7(),
        }
    }

    pub fn new_internal_error() -> Self {
        Self::new(
            "Internal server error".to_string(),
            StatusCode::INTERNAL_SERVER_ERROR,
        )
    }
}

impl IntoResponse for ErrorObject {
    fn into_response(self) -> axum::response::Response {
        (self.code, Json(self)).into_response()
    }
}
