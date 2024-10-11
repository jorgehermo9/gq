export SQLX_OFFLINE := "true"

ci: fmt clippy test build
fmt:
    cargo fmt --check
clippy:
    cargo clippy --tests --locked -- -Dwarnings
test:
    cargo nextest r --locked
build:
    cargo build --release
