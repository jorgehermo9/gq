use apalis::{
    cron::{CronStream, Schedule},
    layers::retry::{RetryLayer, RetryPolicy},
    prelude::{Monitor, WorkerBuilder, WorkerFactoryFn},
    utils::TokioExecutor,
};
use gq_server::tasks::cleanup;
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::{env, net::SocketAddr};
use tracing::level_filters::LevelFilter;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

#[tokio::main]
async fn main() {
    let env_filter = EnvFilter::builder()
        .with_default_directive(LevelFilter::INFO.into())
        .from_env_lossy();
    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(env_filter)
        .init();

    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = SocketAddr::from(([0, 0, 0, 0], port.parse().expect("PORT must be a number")));

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let database_connections = env::var("DATABASE_CONNECTIONS")
        .map(|s| {
            s.parse()
                .unwrap_or_else(|_| panic!("DATABASE_CONNECTIONS must be a number. Got {s}"))
        })
        .unwrap_or(5);
    let db_connection = PgPoolOptions::new()
        .max_connections(database_connections)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    let max_share_expiration_time_secs = env::var("MAX_SHARE_EXPIRATION_TIME_SECS")
        .map(|s| {
            s.parse().unwrap_or_else(|_| {
                panic!("MAX_SHARE_EXPIRATION_TIME_SECS must be a number. Got {s}")
            })
        })
        .unwrap_or(24 * 7)
        * 60
        * 60;

    assert!(
        max_share_expiration_time_secs > 0,
        "MAX_SHARE_EXPIRATION_TIME_SECS must be > 0"
    );

    let cleanup_task_cron_expression =
        env::var("CLEANUP_TASK_CRON_EXPRESSION").unwrap_or_else(|_| "0 0 0 * * * *".to_string());

    sqlx::migrate!("./migrations")
        .run(&db_connection)
        .await
        .expect("Failed to run migrations");

    let app = gq_server::app(db_connection.clone(), max_share_expiration_time_secs);
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap_or_else(|_| panic!("Failed to bind address {addr}"));

    tracing::info!("Server started. Listening on {addr}");

    if let Err(error) = tokio::try_join!(
        start_axum_server(listener, app),
        start_background_tasks(cleanup_task_cron_expression, db_connection)
    ) {
        panic!("Error during start: {error}");
    }
}

#[derive(Debug, thiserror::Error)]
enum StartError {
    #[error("Failed to start axum server: {0}")]
    Axum(std::io::Error),
    #[error("Failed to start scheduler: {0}")]
    Scheduler(#[from] SchedulerError),
}

#[derive(Debug, thiserror::Error)]
enum SchedulerError {
    #[error("Failed to parse cron expression {0}: {1}")]
    CronExpressionError(String, cron::error::Error),
    #[error("Failed to start scheduler: {0}")]
    MonitorStartError(std::io::Error),
}

async fn start_axum_server(
    listener: tokio::net::TcpListener,
    app: axum::Router,
) -> Result<(), StartError> {
    axum::serve(listener, app).await.map_err(StartError::Axum)
}

async fn start_background_tasks(
    cron_expression: String,
    db_connection: PgPool,
) -> Result<(), StartError> {
    let schedule: Schedule = cron_expression
        .parse()
        .map_err(|e| SchedulerError::CronExpressionError(cron_expression.to_string(), e))?;

    tracing::info!(schedule = %schedule, "Starting cleanup task worker");

    let worker = WorkerBuilder::new("cleanup-task-worker")
        .layer(RetryLayer::new(RetryPolicy::retries(5)))
        // .layer(TraceLayer::new().make_span_with(ReminderSpan::new()))
        .stream(CronStream::new(schedule).into_stream())
        .data(db_connection)
        .build_fn(cleanup::execute_cleanup);

    Monitor::<TokioExecutor>::new()
        .register(worker)
        .run()
        .await
        .map_err(SchedulerError::MonitorStartError)?;

    Ok(())
}
