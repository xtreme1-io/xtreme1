# syntax=docker/dockerfile:1
FROM maven:3.8-openjdk-11 as build
WORKDIR /build
ADD . .
RUN --mount=type=cache,target=/root/.m2 mvn package

FROM openjdk:11
RUN apt update && \
    apt install -y iputils-ping curl wget netcat
WORKDIR /app
COPY --from=build /build/target/x1-community-backend-1.0-SNAPSHOT.jar ./app.jar
RUN mkdir -p config
EXPOSE 8080
CMD java -jar app.jar