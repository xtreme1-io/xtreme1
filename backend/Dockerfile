# syntax=docker/dockerfile:1
FROM maven:3.8-openjdk-11 as build
WORKDIR /build
ADD . .
RUN --mount=type=cache,target=/root/.m2 mvn package

FROM openjdk:11-jre
RUN apt update && \
    apt install -y iputils-ping curl wget netcat
WORKDIR /app
COPY --from=build /build/target/xtreme1-backend-0.5.2-SNAPSHOT.jar ./app.jar
RUN mkdir -p config
RUN wget 'https://basicai-asset.s3.us-west-2.amazonaws.com/xtreme1/xtreme1-lidar-fusion-trial.zip' -O xtreme1-lidar-fusion-trial.zip
EXPOSE 8080
CMD java -jar app.jar