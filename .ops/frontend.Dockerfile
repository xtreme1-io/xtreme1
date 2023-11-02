FROM nginx:1.22

COPY $FRONTEND_PACKAGE_DIR /usr/share/nginx/html
