FROM tjmehta/node-http-server

WORKDIR /app
COPY $FRONTEND_PACKAGE_DIR ./

EXPOSE 8080

CMD ["http-server", "./"]
