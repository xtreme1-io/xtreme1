<div align="center">
<img width="386" alt="Xtreme1 logo" src="https://user-images.githubusercontent.com/84139543/190300943-98da7d5c-bd67-4074-a94f-b7405d29fb90.png">

![](https://img.shields.io/badge/Release-v0.5-green) 
![](https://img.shields.io/badge/License-Apache%202.0-blueviolet)
<a href="https://join.slack.com/share/enQtNDA4MjA4MzEwNjg1Mi04ZDc1NmI4YzMxNjgyYWRhZGExMzM1NzllZTQ3Yzk5ZjAzZWQ4MWM5ZjNiZmQ0OGE2YzU5YTkwZGIzNTc5ZGMz" alt="Join Slack">
<img src="https://img.shields.io/static/v1?label=Join&message=Slack&color=ff69b4" /></a>
<a href="https://twitter.com/BasicAIteam" alt="Follow Twitter"><img src="https://img.shields.io/badge/Follow-Twitter-blue" /></a>
<a href="https://app.basic.ai/#/login" alt="app">
<img src="https://img.shields.io/badge/Xtreme1-App-yellow" /></a>    
[![Docs](https://img.shields.io/badge/Docs-Stable-success.svg?style=flat&longCache=true)](http://docs.basic.ai/)
</div>


# Intro #
BasicAI Xtreme1 is an open-source suite that speedily develops and iterates your datasets and models. The built-in AI-assisted tools take your labeling efforts to the next level of efficiency. Your full data-centric MLOps lifecycle is taken care of with reproducibility, manageability, and automation.

Xtreme1 was released under the open-source Apache License 2.0 in September 2022.

# Support #
[Website](https://basic.ai) | [Slack](https://join.slack.com/share/enQtNDA4MjA4MzEwNjg1Mi04ZDc1NmI4YzMxNjgyYWRhZGExMzM1NzllZTQ3Yzk5ZjAzZWQ4MWM5ZjNiZmQ0OGE2YzU5YTkwZGIzNTc5ZGMz) | [Twitter](https://twitter.com/BasicAIteam) |  [LinkedIn](https://www.linkedin.com/company/basicaius/about/?viewAsMember=true) | [Issues](https://github.com/basicai/xtreme1/issues)

A community is important for the company. We are very open to feedback and encourage you to create Issues and help us grow!

[👉 Join us on Slack today!](https://join.slack.com/share/enQtNDA4MjA4MzEwNjg1Mi04ZDc1NmI4YzMxNjgyYWRhZGExMzM1NzllZTQ3Yzk5ZjAzZWQ4MWM5ZjNiZmQ0OGE2YzU5YTkwZGIzNTc5ZGMz)

# Key features #

 :one: Data labeling for images, 3D LiDAR and 2D&3D Sensor Fusion datasets
 
 :two: Built-in models for object detection, instance segmentation and classification
 
 :three: Configurable Ontology for general classes (hierarchies) and attributes for use in your model training
 
 :four: Data management and quality control
 
 :five: Data debug and model-training
 
 :six: AI-powered tools for model performance evaluation
 

# Quick start

* Get early access to [Xtreme1 online version](https://app.basic.ai/#/login/) without any installation :rocket:

* [Run with release package](#run-with-release-package) :cd:
* [Run with source code](#run-with-source-code) :wrench:

## Run with release package

### Prerequisites 

We use Docker Compose to simplify running multiple containers together, the latest [Docker Desktop](https://docs.docker.com/desktop/) already integrated `docker compose` subcommand. If you haven't installed Docker Desktop yet, you should install it first.

### Download release package

Click the latest release on the right of repository home, select asset whose name likes `xtreme1-<version>.zip`, and double click the downloaded package to unzip it. Or use the following command to download the package and unzip it, you should replace the version number to the lastest.

```bash
wget https://github.com/basicai/xtreme1/releases/download/v0.5/xtreme1-v0.5.zip
unzip -d xtreme1-v0.5 xtreme1-v0.5.zip
```

### Start all services

Enter into the release package directory, and execute the following command to start all services. If everything shows ok in console, you can open address `http://localhost:8190` in your favorite browser (Chrome recommend) to try out Xtreme1.

```bash
docker compose up
```

> :warning: Some Docker images, such as `MySQL`, do not support arm platform, if your computer is using arm cpu, such as Apple M1, you can add Docker Compose override file `docker-compose.override.yml`, which contains the following content. It will force using `amd64` image to run on `arm64` platform through QEMU emulation, but the performance will be affected.

```yaml
services:
  mysql:
    platform: linux/amd64
```
<img src="https://www.basic.ai/_nuxt/img/4f457dd.png" alt="xtreme1_lidar_page">

### Docker Compose advanced

It is recommended to use Compose V2+ and the new `docker compose` command, not the old `docker-compose` command, you can see the differences between the two in the document [Overview of Docker Compose](https://docs.docker.com/compose/).

> Docker Desktop(Mac, Win, Linux) will auto install Docker Compose. If you are on Linux server, you can install Docker Compose plugin following this article [Install Docker Compose CLI plugin](https://docs.docker.com/compose/install/compose-plugin/).

Here is more advanced commands for Docker Compose.

```bash
# Start in foreground.
docker compose up

# Or add -d option to run in background.
docker compose up -d

# You need to explicitly specify model profile to start all model related services, the model services need GPU resource.
docker compose --profile model up

# When up finished, you can start or stop all or specific service.
docker compose start
docker compose stop

# Stop all services and delete all containers, but data volumes will be kept.
docker compose down

# Delete volumes together, you will lose all your data in mysql, redis and minio, be careful!
docker compose down -v
```

It'll pull all service images from Docker Hub, including basic services `mysql`, `redis`, `minio`, and application services `backend`, `frontend` etc. You can find the username, password, hot binding port to access MySQL, Redis and MinIO in `docker-compose.yml`. We use Docker volume to save data, so you won't lose any data between container recreating.

After successfully started all services, you can open `http://localhost:8190` to access web frontend, and access MinIO console at `http://localhost:8194`.

## Run with source code

### Enable Docker BuildKit

We are using Docker BuildKit to accelerate the building speed, such as cache Maven and NPM packages between builds. By default BuildKit is not enabled in Docker Desktop, you can enable it as following. For more details, you can check the official document [Build images with BuildKit](https://docs.docker.com/develop/develop-images/build_enhancements/).

```bash
# Set environment variable to enable BuildKit just for once.
DOCKER_BUILDKIT=1 docker build .
DOCKER_BUILDKIT=1 docker compose up

# Or edit Docker daemon.json to enable BuildKit by default, the content can be something like '{ "features": { "buildkit": true } }'.
vi /etc/docker/daemon.json

# You can clear builder cache if you encounter some package version related problem.
docker builder prune
 ```

### Clone repository

```bash
git clone https://github.com/basicai/xtreme1.git
cd xtreme1
```

### Build images and run services with Docker Compose

The default `docker-compose.yml` will pull all images from Docker Hub, including application images like `backend`, `frontend` etc. If you changed the code, and want to know whether it works or not, you can comment service's image line and uncomment build line, like following.

```yaml
services:
  backend:
    # image: basicai/xtreme1-backend
    build: ./backend
  frontend:
    # image: basicai/xtreme1-frontend
    build: ./frontend
```

Then you can run `docker compose up` to build `backend` and `frontend` image from source code and start all services. Be sure to run `docker compose build` when code changes, as up command will only build image when it not exist.

Also you can run each application service in your favorite IDE, like IDEA or Visual Studio Code. For `backend` service which need `mysql`, `redia` and `minio`, you can start these services with Docker Compose, and connect these services using host binding port.

> You should not commit your change to `docker-compose.yml`, to avoid this, you can copy `docker-compose.yml` to a new file `docker-compose.develop.yml`, and modify this file as your development need, as this file is already added into `.gitignore`. And you need to specify this specific file when running Docker Compose command, such as `docker compose -f docker-compose.develop.yml build`.

### Using your existing base services

If you already have MySQL, Redis, or MinIO base services, you can use it directly, and not depend on Docker Compose to manage these services, but you need to change `backend` service's configuration. You can change configurations in default configuration file at `backend/src/main/resources/application.yml`, or using command option `-Dspring.profiles.active=local` to specify a local configuration file to override the default one.

To get more development guides, you can read the README in each application service's directory.

# License #
This software is licensed under the Apache 2.0 LICENSE © BasicAI.

If Xtreme1 is part of your development process / project / publication, please cite us ❤️ :
```bash
@misc{BasicAI,
title = {Xtreme1 - The Next GEN Platform For Multisensory Training Data},
year = {2022},
note = {Software available from https://github.com/basicai/xtreme1/},
url={https://basic.ai/},
author = {BasicAI},
}
