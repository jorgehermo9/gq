FROM rust:1.80 AS chef
# `wasm-pack` dependency `libz-ng-sys 1.1.15` needs cmake
# Remember to delete this once `libz-ng-sys 1.1.17` is used, since
# it doesn't need cmake https://github.com/rust-lang/libz-sys/releases/tag/1.1.17
RUN apt-get update && apt-get install -y cmake
RUN cargo install cargo-chef --version 0.1.67 --locked
RUN cargo install wasm-pack --version 0.13.0 --locked
RUN rustup target add wasm32-unknown-unknown
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --package gq-web --release --recipe-path recipe.json --target wasm32-unknown-unknown
COPY . .
WORKDIR /app/crates/web
RUN wasm-pack build --out-dir ./pkg --target web

FROM node:22.2-bookworm
WORKDIR /app
RUN npm install --global pm2@5.4.0
COPY --from=builder /app/crates/web/pkg ./pkg
COPY ./crates/web/frontend/package*.json ./
RUN npm install
COPY ./crates/web/frontend ./
RUN npm run build
USER node
EXPOSE 3000
CMD [ "pm2-runtime", "npm", "--", "start" ]
