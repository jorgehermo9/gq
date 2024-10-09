use crate::AppState;
use axum::Router;

mod shares;

pub fn router(app_state: AppState) -> Router {
    Router::new()
        .nest(shares::SHARES_CONTEXT, shares::router())
        .with_state(app_state)
}

macro_rules! build_error_response {
    ($error:expr) => {{
        let original_error = format!("{:?}", $error);
        let original_error_message = $error.to_string();
        let error_object = ErrorObject::from($error);

        if error_object.code.is_server_error() {
            tracing::error!(
                status_code = error_object.code.as_u16(),
                trace_id = %error_object.trace_id,
                timestamp = error_object.timestamp.to_rfc3339(),
                original_error = original_error,
                original_error_message = original_error_message,
                "Returned HTTP server error response"
            );
        } else {
            tracing::info!(
                status_code = error_object.code.as_u16(),
                trace_id = %error_object.trace_id,
                timestamp = error_object.timestamp.to_rfc3339(),
                original_error = original_error,
                original_error_message = original_error_message,
                "Returned HTTP error response"
            );
        }
        error_object.into_response()
    }};
}

pub(crate) use build_error_response;
