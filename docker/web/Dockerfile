FROM nginx:1.27-alpine
COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY out /usr/share/nginx/html
EXPOSE 80