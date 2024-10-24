FROM docker.io/node:23-bookworm AS build
WORKDIR /app
COPY docs/package*.json ./
RUN npm install
COPY docs .
RUN npm run build

FROM docker.io/nginx:1.27.2-bookworm AS runtime
COPY docker/docs/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
