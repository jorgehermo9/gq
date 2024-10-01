ci: fmt clippy test
fmt:
    cargo fmt --check
clippy:
    cargo clippy --tests --locked -- -Dwarnings
test:
    cargo nextest r --locked
