FROM docker.io/nginx:1.27.2-bookworm AS runtime
COPY docker/gateway/nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
