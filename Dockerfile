FROM rust:1.78.0 as builder
# WORKDIR /usr/app
# RUN cargo install wasm-pack
# COPY ../../Cargo.* .
# RUN mkdir -p crates/web
# WORKDIR /usr/app/crates/web
# COPY ./Cargo.* ./
# RUN mkdir src && echo "fn main() {println!(\"if you see this, the build broke\")}" > src/lib.rs\
# 	&& cargo build --release
# COPY ./src ./src
# RUN wasm-pack build --out-dir ./pkg --target web
WORKDIR /usr/app
RUN cargo install wasm-pack
COPY . .
WORKDIR /usr/app/crates/web
RUN wasm-pack build --out-dir ./pkg --target web

FROM node:alpine
WORKDIR /usr/app
RUN npm install --global pm2
COPY --from=builder /usr/app/crates/web/pkg ./pkg
COPY ./crates/web/frontend/package*.json ./
RUN npm install
COPY ./crates/web/frontend ./
RUN npm run build
USER node
EXPOSE 3000
CMD [ "pm2-runtime", "npm", "--", "start" ]
