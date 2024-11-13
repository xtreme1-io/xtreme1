# syntax=docker/dockerfile:1
FROM maven:3.8-openjdk-11 as build
WORKDIR /build
ADD . .
RUN --mount=type=cache,target=/root/.m2 mvn package

FROM openjdk:11-jre
RUN apt update && \
    apt install -y iputils-ping curl wget netcat python3 python3-pip git
RUN pip3 install --upgrade --force-reinstall git+https://github.com/xtreme1-io/xtreme1-sdk.git@6b53a73
WORKDIR /app
COPY --from=build /build/target/xtreme1-backend-0.9.1-SNAPSHOT.jar ./app.jar
RUN mkdir -p config
RUN wget 'https://github.com/xtreme1-io/asset/raw/main/datasets/xtreme1-lidar-fusion-trial.zip' -O xtreme1-lidar-fusion-trial.zip
RUN wget 'https://github.com/xtreme1-io/asset/raw/main/datasets/xtreme1-image-trial.zip' -O xtreme1-image-trial.zip
EXPOSE 8080
CMD java -jar app.jar