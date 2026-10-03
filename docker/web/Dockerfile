# 1.29 lleva Alpine 3.23 (el 1.27-alpine quedó congelado en Alpine 3.21, sin
# parches de seguridad: 2 CRITICAL + 42 HIGH en libcrypto3/libssl3/libexpat/libpng).
FROM nginx:1.29-alpine
COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY out /usr/share/nginx/html
EXPOSE 80