# X1

X1 community edition from [Basic AI](https://www.basic.ai/).

## What is X1

## Components and Architecture

![Components and Architecture](/docs/images/components-and-architecture.png?raw=true)

| Layer | Component | Description |
| --- | --- | --- |
| Application Services | Frontend | Web user interface, written in Vue3 and Typescript. |
| Application Services | Backend | Data API for managing user, dataset, annotation object etc., written in Java and Spring Boot. |
| Application Services | Image Object Detection | AI auto detect objects in image, written in Python and PyTorch. |
| Application Services | Point Cloud Object Detection | AI auto detect objects in point cloud, written in Python and PyTorch. |
| Base Services | MySQL | Relational database for storing business data. |
| Base Services | Redis | Cache hot data, and schedule background tasks. |
| Base Services | MinIO | Store unstructured data like image and point cloud files. |

## Try out X1

* [Run with Docker Compose](#run-with-docker-compose)
* [Local development](#local-development)

### Branches

* **dev** Default branch, contains the newest feature and bug fix, but may not be stable, do not use in production.
* **main** Stable release, well tested.

### Run with Docker Compose

It is recommended to use Compose V2 and the new `docker compose` command, not the old `docker-compose` command, you can see the differences between the two in the document [Overview of Docker Compose](https://docs.docker.com/compose/).

> Docker Desktop(Mac, Win, Linux) will auto install Docker Compose. If you are on Linux server, you can install Docker Compose plugin following this article [Install Docker Compose CLI plugin](https://docs.docker.com/compose/install/compose-plugin/).

Run the following command to start all services of X1, each service run in a docker container.
```bash
# Start in forground.
docker compose up

# Or add -d option to run in background.
docker compose up -d

# You need to explicitly specify model profile to start all model related services.
docker compose --profile model up
```

It'll pull all needed service images from Docker Hub, including basic services `mysql`, `redis`, `minio`, and application services `basicai/x1-community-backend`, `basicai/x1-community-frontend` etc. You can find the username and password to access MySQL and MinIO in `docker-compose.yml`, and the host binding port of each service, for example, you can access MinIO console at `http://localhost:8194`.

> Some Docker images, such as `mysql`, do not support arm platform, if your computer is using arm cpu, such as Apple M1, you can add Docker Compose override file `docker-compose.override.yml`, which contains the following content.

```yaml
services:
  mysql:
    platform: linux/amd64

```

It will force using `amd64` image to run on `arm64` platform through QEMU emulation, but the performance will be affected.

### Local development

#### Enable Docker BuildKit

We are using Docker BuildKit to accelerate the building speed, such as cache Maven and NPM packages between builds. By default BuildKit is not enabled in Docker Desktop, you can enable it as following. For more details, you can check the official document [Build images with BuildKit](https://docs.docker.com/develop/develop-images/build_enhancements/).

```bash
# Set environment variable to enable BuildKit just for once.
$ DOCKER_BUILDKIT=1 docker build .
$ DOCKER_BUILDKIT=1 docker compose up

# Or edit Docker daemon.json to enable BuildKit by default.
$ vi /etc/docker/daemon.json
 { "features": { "buildkit": true } }
 ```

#### Develop with Docker Compose

#### Develop with your own MySQL, Rdis and MinIO

## Features

## Roadmap

## License
