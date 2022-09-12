# syntax=docker/dockerfile:1
FROM maven:3.8-openjdk-11 as build
WORKDIR /build
ADD . .
RUN --mount=type=cache,target=/root/.m2 mvn package

FROM openjdk:11
RUN apt update && \
    apt install -y iputils-ping curl wget netcat
WORKDIR /app
COPY --from=build /build/target/x1-community-backend-0.5-SNAPSHOT.jar ./app.jar
RUN mkdir -p config
RUN wget 'https://basicai-dataset-tmp-minio-endpoint.alidev.beisai.com/x1-community/1000/750036/41497263464d4520a0ff542ab9aec8fd/x1-point-cloud-result.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=admin%2F20220908%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220908T071607Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=9d17db81e1554a0805c37b1e24ecb76a78226bea91adf5d137830cde28723745' -O x1-point-cloud-result.zip
EXPOSE 8080
CMD java -jar app.jar