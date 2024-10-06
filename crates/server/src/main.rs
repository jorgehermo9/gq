use std::{env, net::SocketAddr};

use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() {
    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = SocketAddr::from(([0, 0, 0, 0], port.parse().unwrap()));

    let database_url = env::var("DATABASE_URL").unwrap();
    let database_connections = env::var("DATABASE_CONNECTIONS")
        .map(|s| s.parse().unwrap())
        .unwrap_or(5);
    let db_connection = PgPoolOptions::new()
        .max_connections(database_connections)
        .connect(&database_url)
        .await
        .unwrap();

    sqlx::migrate!("./migrations")
        .run(&db_connection)
        .await
        .unwrap();

    let app = gq_server::app(db_connection);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
