FROM openjdk:11

RUN apt update && \
    apt install -y iputils-ping curl wget netcat
RUN apt update && \
    apt install -y iputils-ping curl wget netcat python3 python3-pip
RUN pip3 install git+https://github.com/xtreme1-io/xtreme1-sdk.git
WORKDIR /app
COPY target/$BACKEND_PACKAGE_NAME ./app.jar
RUN mkdir -p config

EXPOSE 8080

CMD exec java $JAVA_OPTS -jar app.jar $APP_ARGS