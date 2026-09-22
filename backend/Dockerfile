# syntax=docker/dockerfile:1
FROM --platform=$BUILDPLATFORM maven:3.8-eclipse-temurin-11 as build
WORKDIR /build
ADD . .
RUN --mount=type=cache,target=/root/.m2 mvn package

# openjdk images were removed from Docker Hub; JDK 11.0.16 also crashes on cgroup v2 hosts
FROM eclipse-temurin:11-jre-jammy
RUN apt update && \
    apt install -y iputils-ping curl wget netcat python3 python3-pip git
RUN pip3 install --upgrade --force-reinstall git+https://github.com/xtreme1-io/xtreme1-sdk.git@a16984b
WORKDIR /app
# A glob, not the versioned name: target holds one .jar beside one .jar.original,
# so this keeps working when <version> moves and nothing has to be renamed.
COPY --from=build /build/target/*.jar ./app.jar
RUN mkdir -p config
RUN wget 'https://github.com/xtreme1-io/asset/raw/main/datasets/xtreme1-lidar-fusion-trial.zip' -O xtreme1-lidar-fusion-trial.zip
RUN wget 'https://github.com/xtreme1-io/asset/raw/main/datasets/xtreme1-image-trial.zip' -O xtreme1-image-trial.zip
EXPOSE 8080
CMD exec java $JAVA_OPTS -jar app.jar $APP_ARGS