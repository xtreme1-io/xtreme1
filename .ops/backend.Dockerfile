FROM openjdk:11

RUN apt update && \
    apt install -y iputils-ping curl wget netcat python3 python3-pip
RUN pip3 install --upgrade --force-reinstall git+https://github.com/xtreme1-io/xtreme1-sdk.git@d0cf4cc
WORKDIR /app
COPY target/$BACKEND_PACKAGE_NAME ./app.jar
RUN mkdir -p config
RUN wget 'https://basicai-asset.s3.us-west-2.amazonaws.com/xtreme1/xtreme1-lidar-fusion-trial.zip' -O xtreme1-lidar-fusion-trial.zip
RUN wget 'https://basicai-asset.s3.us-west-2.amazonaws.com/xtreme1/xtreme1-image-trial.zip' -O xtreme1-image-trial.zip

EXPOSE 8080

CMD exec java $JAVA_OPTS -jar app.jar $APP_ARGS