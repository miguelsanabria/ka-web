FROM nginx:1.29-alpine
COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf
# Fuera de conf.d a propósito: allí nginx lo incluiría dentro de http{} y un
# add_header a ese nivel no es válido.
COPY docker/web/security-headers.conf /etc/nginx/security-headers.conf
COPY out /usr/share/nginx/html
EXPOSE 80