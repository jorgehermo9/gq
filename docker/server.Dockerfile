FROM docker.io/rust:1.81 AS chef
WORKDIR /app
RUN cargo install cargo-chef --version 0.1.67 --locked

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --package gq-server --release --recipe-path recipe.json
COPY . .
ENV SQLX_OFFLINE true
RUN cargo build --package gq-server --release

FROM docker.io/debian:bookworm
COPY --from=builder /app/target/release/gq-server .
CMD [ "./gq-server" ]
