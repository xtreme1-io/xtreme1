![](https://img.shields.io/badge/Apache--2.0-license-green)
# Xtreme1

Xtreme1 for community, free and open source, powered by [Basic AI](https://www.basic.ai/).

## What is Xtreme1

## Components and Architecture

![Layer Architecture](/docs/images/layer-architecture.png?raw=true)

| Layer | Component | Description |
| --- | --- | --- |
| Application Services | Web Frontend | Web user interface, written in Vue3 and Typescript. |
| Application Services | API Backend | Data API for managing user, dataset, annotation object etc., written in Java and Spring Boot. |
| Application Services | Image Object Detection | AI auto detect objects in image, written in Python and PyTorch. |
| Application Services | Point Cloud Object Detection | AI auto detect objects in point cloud, written in Python and PyTorch. |
| Base Services | MySQL | Relational database for storing business data. |
| Base Services | Redis | Cache hot data, and schedule background tasks. |
| Base Services | MinIO | Store unstructured data like image and point cloud files. |

## Try out Xtreme1

* [Run with Docker Compose](#run-with-docker-compose)
* [Local development](#local-development)

### Branches

* **dev** Contains the newest features and bug fixes, but may not be stable, do not use in production.
* **main** Default branch, stable and well tested.

### Run with Docker Compose

#### Quick Start

##### Prerequisites 

We use Docker Compose to simplify running multiple containers together, the latest [Docker Desktop](https://docs.docker.com/desktop/) already integrated `docker compose` subcommand. If you haven't installed Docker Desktop yet, you should install it first.

##### Download release package

Click the latest release on the right of repository home, select asset who's name likes `x1-community-<version>.zip`, and double click the downloaded package to unzip it. Or use the following command to download the package and unzip it, you should replace the version number to the lastest.

```bash
wget https://github.com/basicai/xtreme1/releases/download/v0.5/x1-community-v0.5.zip
unzip -d x1-community-v0.5 x1-community-v0.5.zip
```

##### Start all services

Enter into the release package directory, and execute the following command to start all services. If everything shows ok in console, you can open address `http://localhost:8190` in your favorite browser (Chrome recommend) to try out Xtreme1.

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

## Features

## Roadmap

## License
