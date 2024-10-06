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

# https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md
sqlx-check:
    cargo sqlx prepare --check --workspace
sqlx-prepare:
    cargo sqlx prepare --workspace
