FROM openjdk:11

RUN apt update && \
    apt install -y iputils-ping curl wget netcat

WORKDIR /app
COPY target/$BACKEND_PACKAGE_NAME ./app.jar
RUN mkdir -p config

EXPOSE 8080

CMD exec java $JAVA_OPTS -jar app.jar $APP_ARGS