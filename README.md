# X1

X1 community edition from [Basic AI](https://www.basic.ai/).

## What is X1

## Try out X1

* [Run with Docker Compose](#run-with-docker-compose)
* [Local development](#local-development)

### Run with Docker Compose

It is recommended to use Compose V2 and the new `docker compose` command, not the old `docker-compose` command, you can see the differences between the two in the document [Overview of Docker Compose](https://docs.docker.com/compose/).

Run the following command to start all services of X1, each service run in a docker container.
```bash
# Start in forground
docker compose up

# Or add -d option to run in background
docker compose up -d

# You need to explicitly specify model profile to start all model related services
docker compose --profile model up
```

It'll pull all needed service images from Docker Hub, including basic services `mysql`, `redis`, `minio`, and application services `basicai/x1-community-backend`, `basicai/x1-community-frontend` etc.

### Local development

#### Branch usage

#### Project structure

#### Develop with Docker Compose

#### Develop with your own MySQL, Rdis and MinIO

## Features

## Roadmap

## License
