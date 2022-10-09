<div align="center">
<img width="386" alt="Xtreme1 logo" src="https://user-images.githubusercontent.com/84139543/190300943-98da7d5c-bd67-4074-a94f-b7405d29fb90.png">

![](https://img.shields.io/badge/Release-v0.5.1-brightgreen) 
![](https://img.shields.io/badge/License-Apache%202.0-blueviolet)
[![Slack](https://img.shields.io/badge/Join-Slack-orange.svg?logo=slack)](https://join.slack.com/t/basicai/shared_invite/zt-1dd26nn1d-JPK00lwvGdb5XrAfH51Eag)
[![Twitter](https://img.shields.io/badge/Follow-Twitter-blue)](https://twitter.com/BasicAIteam)
[![Online](https://img.shields.io/badge/Xtreme1_Online-App-yellow)](https://app.basic.ai/#/login)
[![Docs](https://img.shields.io/badge/Docs-Stable-success.svg?style=flat&longCache=true)](http://docs.basic.ai/) 
</div>

# Intro #
BasicAI launched the global 1st open-source platform for multisensory training data. 

Xtreme1 provides deep insight into data annotation, data curation, and ontology management to solve 2d image and 3d point cloud dataset ML challenges.
The built-in AI-assisted tools take your annotation efforts to the next level of efficiency for your 2d/3D Object Detection, 3D Instance Segmentation, and LiDAR-Camera Fusion projects.

# Support #
[Website](https://basic.ai) | [Slack](https://join.slack.com/t/basicai/shared_invite/zt-1dd26nn1d-JPK00lwvGdb5XrAfH51Eag) | [Twitter](https://twitter.com/BasicAIteam) |  [LinkedIn](https://www.linkedin.com/company/basicaius/about/?viewAsMember=true) | [Issues](https://github.com/basicai/xtreme1/issues) 

Join the Xtreme1 community on Slack to share your suggestions, advice, and questions with us.

[👉 Join us on Slack today!](https://join.slack.com/t/basicai/shared_invite/zt-1dd26nn1d-JPK00lwvGdb5XrAfH51Eag)

# Key features #

Image Bounding-box Annotation - Object Detection Model |  Image Segmentation Annotation - [YOLOR](https://github.com/WongKinYiu/yolor)
:-------------------------:|:-------------------------:
![](/docs/images/image-bbox-model.gif)  |  ![](/docs/images/2d-seg-model.gif)

 :one: Supports data labeling for images, 3D LiDAR and 2D&3D Sensor Fusion datasets
 
 :two: Built-in pre-labeling and interactive models support 2d/3d object detection, segmentation and classification
 
 :three: Configurable Ontology Center for general classes (with hierarchies) and attributes for use in your model training

 :four: Data management and quality monitoring
 
 :five: Find labeling errors and fix them
 
 :six: Model results visualization to help you evaluate your model

3D Point Cloud Cuboid Annotation - [OpenPCDet](https://github.com/open-mmlab/OpenPCDet) |  3D Point Cloud Object Tracking Annotation - LiDAR-based 3D Object Tracking Model
:-------------------------:|:-------------------------:
![](/docs/images/3d-annotation.gif)  |  ![](/docs/images/3d-track-model.gif)

# Quick start

* Get early access to [Xtreme1 online version](https://app.basic.ai/#/login/) without any installation :rocket:

* [Install and start Xtreme1](#install-and-start-xtreme1) :cd:
* [Build Xtreme1 from source code](#build-xtreme1-from-source-code) :wrench:

## Install and Start Xtreme1

### Prerequisites 

#### Operating System Requirements

Any OS can install the Xtreme1 platform with Docker Compose (installing [Docker Desktop](https://docs.docker.com/desktop/) on Mac, Windows, and Linux devices). On the Linux server, you can install Docker Engine with [Docker Compose Plugin](https://docs.docker.com/compose/install/linux/).

#### Hardware Requirements

| Component  | Recommended configuration |
| ------------- | ------------- |
| CPU | AMD64 or ARM64 |
| RAM | 2GB or more |
| Hard Drive | 10GB or more (depends on data size) |

#### Software Requirements

For Mac, Windows, and Linux with desktop:

| Software | Version |
| ------------- | ------------- |
| Docker Desktop | 4.1 or higher |

For Linux server:

| Software | Version |
| ------------- | ------------- |
| Docker Engine | 20.10 or higher |
| Docker Compose Plugin | 2.0 or higher |

#### :warning: (Build-in) Models Deployment Requirements

Right row models only can be running on Linux server with [NVIDIA Driver](https://docs.nvidia.com/datacenter/tesla/tesla-installation-notes/index.html) and [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker).

| Component | Recommended configuration |
| ------------- | ------------- |
| GPU | Nvidia Tesla T4 or other similar Nvidia GPU  |
| GPU RAM | 6G or more |
| RAM | 4G or more |

### Download release package

Click the latest release on the right of repository home, select asset whose name likes `xtreme1-<version>.zip`, and double click the downloaded package to unzip it. Or use the following command to download the package and unzip it, you should replace the version number to the lastest.

```bash
wget https://github.com/basicai/xtreme1/releases/download/v0.5.1/xtreme1-v0.5.1.zip
unzip -d xtreme1-v0.5.1 xtreme1-v0.5.1.zip
```

### Start all services

Enter into the release package directory, and execute the following command to start all services. It need a few minutes to init database and prepare a test dataset, if everything shows ok in console, you can open address `http://localhost:8190` in your favorite browser (Chrome recommend) to try out Xtreme1. You can replace `localhost` to ip address if you want to access from another computer.

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

### Docker Compose advanced commands

```bash
# Start in foreground.
docker compose up

# Or add -d option to run in background.
docker compose up -d

# When up finished, you can start or stop all or specific service.
docker compose start
docker compose stop

# Stop all services and delete all containers, but data volumes will be kept.
docker compose down

# Delete volumes together, you will lose all your data in mysql, redis and minio, be careful!
docker compose down -v
```

Docker compose will pull all service images from Docker Hub, including basic services `mysql`, `redis`, `minio`, and application services `backend`, `frontend`. You can find the username, password, hot binding port to access MySQL, Redis and MinIO in `docker-compose.yml`, for example you can access MinIO console at `http://localhost:8194`. We use Docker volume to save data, so you won't lose any data between container recreating.

### Enable model services

```bash
# You need to explicitly specify model profile to enable model services.
docker compose --profile model up
```

> Make sure you have installed [NVIDIA Driver](https://docs.nvidia.com/datacenter/tesla/tesla-installation-notes/index.html) and [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker). But you do not need to install the CUDA Toolkit, as it already contained in the model image.

## Build Xtreme1 from source code

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

### Build images and run services

The `docker-compose.yml` default will pull application images from Docker Hub, if you want to build images from source code, you can comment service's image line and uncomment build line.

```yaml
services:
  backend:
    # image: basicai/xtreme1-backend
    build: ./backend
  frontend:
    # image: basicai/xtreme1-frontend
    build: ./frontend
```

Then when you run `docker compose up`, it will first build `backend` and `frontend` image and start services. Be sure to run `docker compose build` when code changed, as up command will only build image when it not exist.

> You should not commit your change to `docker-compose.yml`, to avoid this, you can copy `docker-compose.yml` to a new file `docker-compose.develop.yml`, and modify this file as your development need, as this file is already added into `.gitignore`. And you need to specify this specific file when running Docker Compose command, such as `docker compose -f docker-compose.develop.yml build`.

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
