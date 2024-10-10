use std::{env, net::SocketAddr};

use sqlx::postgres::PgPoolOptions;
use tracing::level_filters::LevelFilter;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

#[tokio::main]
async fn main() {
    // TODO: background vacuum job

    let env_filter = EnvFilter::builder()
        .with_default_directive(LevelFilter::INFO.into())
        .from_env_lossy();
    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(env_filter)
        .init();

    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = SocketAddr::from(([0, 0, 0, 0], port.parse().unwrap()));

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let database_connections = env::var("DATABASE_CONNECTIONS")
        .map(|s| s.parse().unwrap())
        .unwrap_or(5);
    let db_connection = PgPoolOptions::new()
        .max_connections(database_connections)
        .connect(&database_url)
        .await
        .unwrap();

    let max_share_expiration_time_secs = env::var("MAX_SHARE_EXPIRATION_TIME_SECS")
        .map(|s| s.parse().unwrap())
        .unwrap_or(24 * 7)
        * 60
        * 60;

    assert!(
        max_share_expiration_time_secs > 0,
        "MAX_SHARE_EXPIRATION_TIME_SECS must be > 0"
    );

    sqlx::migrate!("./migrations")
        .run(&db_connection)
        .await
        .unwrap();

    let app = gq_server::app(db_connection, max_share_expiration_time_secs);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
