
![](https://img.shields.io/badge/release-v0.5-blue)
 <a href="https://join.slack.com/t/basicai/shared_invite/zt-1dd26nn1d-JPK00lwvGdb5XrAfH51Eag">
    <img src="https://img.shields.io/badge/Slack-Join_Chat-white.svg?logo=slack&style=social" alt="Join Xtreme1 Slack" />
  </a>


# Intro #
BasicAI Xtreme1 is an open source suite that speedily develops and iterates your datasets and models. The built in AI-assisted tools take your labeling efforts to the next level of efficiency. Your full data-centric MLOps lifecycle is taken care of with reproducibility, manageability, and automation.

Xtreme1 was released under the open-source Apache License 2.0 in September 2022.

# Support #
[Website](https://basic.ai) | [Slack](https://join.slack.com/t/basicai/shared_invite/zt-1dd26nn1d-JPK00lwvGdb5XrAfH51Eag) | [Twitter](https://twitter.com/BasicAIteam) |  [LinkedIn](https://www.linkedin.com/company/basicaius/about/?viewAsMember=true) | [Issues](https://github.com/basicai/xtreme1/issues)

A community is important for the company. We are very open to feedback and encourage you to create Issues and help us grow!

# Key features #

 1️⃣: Data labeling for images, 3D LiDAR and 2D&3D Sensor Fusion datasets
 
 :two: Built-in models for object detection, instance segmentation and classification
 
 3️⃣: Configurable Ontology for label, attributes, and more
 
 :four: Data management and quality control
 
 :five: Data debug and model-training
 
 :six: AI-powered tools for model performance evaluation
 

# Quick start
Get early access to Xtreme1 [SaaS version](https://app.basic.ai/#/login/) for 30 days free.

## Install Xtreme1
* [Run with Docker Compose](#run-with-docker-compose)
* [Install for local development](#local-development)

### Run with Docker Compose
#### Prerequisites
- Install [Docker Desktop](https://docs.docker.com/desktop/)
- Check the requirements for hardware and software prior to your installation.

#### Building an image
- Clone the repository from the [GitHub repository](https://github.com/basicai/xtreme1)

```bash
wget https://github.com/basicai/xtreme1/releases/download/v0.5/x1-community-v0.5.zip
unzip -d x1-community-v0.5 x1-community-v0.5.zip
```

##### Start all services
Enter into the release package directory, and execute the following command to start all services.
Next, open the installed Google Chrome browser and go to `http://localhost:8190`.

```bash
docker compose up
```

> Some Docker images, such as `mysql`, do not support arm platform, if your computer is using arm cpu, such as Apple M1, you can add Docker Compose override file `docker-compose.override.yml`, which contains the following content. It will force using `amd64` image to run on `arm64` platform through QEMU emulation, but the performance will be affected.

```yaml
services:
  mysql:
    platform: linux/amd64
```

#### Quick Start - Advanced

It is recommended to use Compose V2 and the new `docker compose` command, not the old `docker-compose` command, you can see the differences between the two in the document [Overview of Docker Compose](https://docs.docker.com/compose/).

> Docker Desktop(Mac, Win, Linux) will auto install Docker Compose. If you are on Linux server, you can install Docker Compose plugin following this article [Install Docker Compose CLI plugin](https://docs.docker.com/compose/install/compose-plugin/).

Run the following command to clone repository and start all services of Xtreme1, each service running in a docker container.
```bash
# Clone repository
git clone https://github.com/basicai/xtreme1.git

# Start in forground.
cd xtreme1
docker compose up

# Or add -d option to run in background.
docker compose up -d

# You need to explicitly specify model profile to start all model related services.
docker compose --profile model up

# When up finished, you can start or stop all or specific service.
docker compose start
docker compose stop

# Stop all services and delete all containers, but data volumes will be kept.
docker compose down

# Delete volumes together, you will lose all your data in mysql, redis and minio, be careful!
docker compose down -v
```

It'll pull all needed service images from Docker Hub, including basic services `mysql`, `redis`, `minio`, and application services `basicai/x1-community-backend`, `basicai/x1-community-frontend` etc. You can find the username, password, hot binding port to access MySQL, Redis and MinIO in `docker-compose.yml`. We use Docker volume to save data, so you won't lose any data between container recreating.

After successfully started all services, you can open `http://localhost:8190` to access web frontend, and access MinIO console at `http://localhost:8194`.

### Local development

#### Enable Docker BuildKit

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

#### Develop with Docker Compose

The default `docker-compose.yml` will pull all images from Docker Hub, including application images like `backend`, `frontend` etc. If you changed the code, and want to known whether it works or not, you can comment service's image line and uncomment build line, like following.

```yaml
services:
  backend:
    # image: basicai/x1-community-backend
    build: ./backend
  frontend:
    # image: basicai/x1-community-frontend
    build: ./frontend
```

> Be sure to run `docker compose build` before running `docker compose up`, as up command will only build image when it not exist.

Also you can run each application service in your favorite IDE, like IDEA or Visual Studio Code. For `backend` service which need `mysql`, `redia` and `minio`, you can start this services using Docker Compose, and connect these services using host binding port. You can use the same method for `frontend` service which need `backend` service.

> You should not commit your change to `docker-compose.yml`, to avoid this, you can copy `docker-compose.yml` to a new file `docker-compose.develop.yml`, and modify this file as your development need, as this file is already add into `.gitignore`. And you need to specify this specific file when running Docker Compose command, such as `docker compose -f docker-compose.develop.yml build`.

#### Develop with your own base services

If you already have an MySQL, Redis, or MinIO base service, you can use it directly, and not depend on Docker Compose to manage these services, but you need to change `backend` service's configuration. You can change configurations in default configuration file at `backend/src/main/resources/application.yml`, or using command argument `--spring.config.additional-location` to specify another configuration file to override the default.

To get more development guides, you can read the README doc in each application service's directory.


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
