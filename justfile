export SQLX_OFFLINE := "true"

ci: fmt clippy test build sqlx-check
fmt:
    cargo fmt --check
clippy:
    cargo clippy --tests --locked -- -Dwarnings
test:
    cargo nextest r --locked
build:
    cargo build --release
sqlx-check:
    sqlx prepare --check --workspace
sqlx-prepare:
    sqlx prepare --workspace
