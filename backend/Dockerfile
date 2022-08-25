FROM openjdk:11

RUN apt update && \
    apt install -y iputils-ping curl wget netcat

WORKDIR /app
COPY target/x1-community-backend-1.0-SNAPSHOT.jar ./app.jar
RUN mkdir -p config

EXPOSE 8080

CMD java -jar app.jar