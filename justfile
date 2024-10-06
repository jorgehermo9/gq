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
    cargo sqlx prepare --check --workspace
sqlx-prepare:
    cargo sqlx prepare --workspace
