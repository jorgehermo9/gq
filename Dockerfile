FROM rust:1.78.0 AS chef
RUN cargo install cargo-chef
RUN cargo install wasm-pack
RUN rustup target add wasm32-unknown-unknown
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder 
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json --target wasm32-unknown-unknown
COPY . .
WORKDIR /app/crates/web
RUN wasm-pack build --out-dir ./pkg --target web


FROM node:alpine
WORKDIR /app
RUN npm install --global pm2
COPY --from=builder /app/crates/web/pkg ./pkg
COPY ./crates/web/frontend/package*.json ./
RUN npm install
COPY ./crates/web/frontend ./
RUN npm run build
USER node
EXPOSE 3000
CMD [ "pm2-runtime", "npm", "--", "start" ]
