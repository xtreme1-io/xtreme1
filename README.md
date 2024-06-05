<div align="center">
<img width="386" alt="Xtreme1 logo" src="https://user-images.githubusercontent.com/84139543/190300943-98da7d5c-bd67-4074-a94f-b7405d29fb90.png">

![](https://img.shields.io/badge/Release-v0.9.1-green) 
![](https://img.shields.io/badge/License-Apache%202.0-blueviolet)
[![Twitter](https://img.shields.io/badge/Follow-Twitter-blue)](https://twitter.com/Xtreme1io)
[![Docs](https://img.shields.io/badge/Docs-Stable-success.svg?style=flat&longCache=true)](http://docs.xtreme1.io/) 

[![Use Cloud for Free](https://basicai-asset.s3.amazonaws.com/docs/Open-source/Operation/App_Button.png)](https://app.basic.ai)
</div>

# Intro

Xtreme1 is an all-in-one open-source platform for multimodal training data.

Xtreme1 unlocks efficiency in data annotation, curation, and ontology management for tackling machine learning challenges in computer vision and LLM. The platform's AI-fueled tools elevate your annotation to the next efficiency level, powering your projects in 2D/3D Object Detection, 2D/3D Semantic/Instance Segmentation, and LiDAR-Camera Fusion like never before.

A long-term free plan is offered in the Xtreme1 Cloud version. Click to [🎉 Use Cloud for Free](https://app.basic.ai).

The README document only includes content related to installation, building, and running, if you have any questions or doubts about features, you can always refer to our [Docs Site](https://docs.xtreme1.io/xtreme1-docs/).

Find us on [Twitter](https://twitter.com/Xtreme1io) |  [Medium](https://medium.com/multisensory-data-training) | [Issues](https://github.com/xtreme1-io/xtreme1/issues) 

# Key Features

Image Annotation (B-box, Segmentation) - [YOLOR](https://github.com/WongKinYiu/yolor) & [RITM](https://github.com/saic-vul/ritm_interactive_segmentation) |  Lidar-camera Fusion Annotation - [OpenPCDet](https://github.com/open-mmlab/OpenPCDet) & [AB3DMOT](https://github.com/xinshuoweng/AB3DMOT)
:-------------------------:|:-------------------------:
![](/docs/images/image_ai.gif)  |  ![](/docs/images/3d_ai.gif)

 :one: Supports data labeling for images, 3D LiDAR and 2D/3D Sensor Fusion datasets
 
 :two: Built-in pre-labeling and interactive models support 2D/3D object detection, segmentation and classification
 
 :three: Configurable Ontology Center for general classes (with hierarchies) and attributes for use in your model training

 :four: Data management and quality monitoring
 
 :five: Find labeling errors and fix them

 :six: Model results visualization to help you evaluate your model
 
 :seven: RLHF for Large Language Models :new: (beta version)

Image Data Curation (Visualizing & Debug)  - [MobileNetV3](https://github.com/xiaolai-sqlai/mobilenetv3) & [openTSNE](https://github.com/pavlin-policar/openTSNE)  | RLHF Annotation Tool for LLM (beta version)
:-------------------------:|:-------------------------:
![](/docs/images/2d_v.gif) |  <img src="/docs/images/0.7rlhf.webp" width="640"> 

# Install

## Prerequisites

*Operating System Requirements*

Any OS can install the Xtreme1 platform with Docker Compose (installing [Docker Desktop](https://docs.docker.com/desktop/) on Mac, Windows, and Linux devices). On the Linux server, you can install Docker Engine with [Docker Compose Plugin](https://docs.docker.com/compose/install/linux/).

*Hardware Requirements*

**CPU**: AMD64 or ARM64  
**RAM**: 2GB or higher  
**Hard Drive**: 10GB+ free disk space (depends on data size)

*Software Requirements*

For Mac, Windows, and Linux with desktop.

**Docker Desktop**: 4.1 or newer

For Linux server.

**Docker Engine**: 20.10 or newer  
**Docker Compose Plugin**: 2.0 or newer

*(Built-in) Models Deployment Requirements*

The built-in model containers only can be running on Linux server with [NVIDIA CUDA Driver](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html) and [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html).

**GPU**: NVIDIA T4 or other similar GPU  
**RAM**: 4G or higher

## Install with Docker

### Download Package

Download the latest release package and unzip it.

```bash
wget https://github.com/xtreme1-io/xtreme1/releases/download/v0.9.1/xtreme1-v0.9.1.zip
unzip -d xtreme1-v0.9.1 xtreme1-v0.9.1.zip
```

### Start Services

Enter into the release package directory, and execute the following command to start all services. It needs a few minutes to initialize database and prepare a test dataset.

```bash
cd xtreme1-v0.9.1
docker compose up
```

Visit [http://localhost:8190](http://localhost:8190) in the browser (Google Chrome is recommended) to try out Xtreme1! You can replace localhost with IP address if you want to access from another machine.

Docker compose will pull all service images from Docker Hub, including basic services `MySQL`, `Redis`, `MinIO`, and application services `backend`, `frontend`. You can find the username, password, hot binding port to access MySQL, Redis and MinIO in `docker-compose.yml`, for example you can access MinIO console at http://localhost:8194. We use Docker volume to save data, so you won't lose any data between container recreating.

Docker Compose advanced commands:

```bash
# Start in the foreground.
docker compose up

# Or add -d option to run in the background.
docker compose up -d

# When finished, you can start or stop all or specific services.
docker compose start
docker compose stop

# Stop all services and delete all containers, but data volumes will be kept.
docker compose down

# Danger! Delete all volumes. All data in MySQL, Redis and MinIO. 
docker compose down -v
```

### Start Built-in Models

You need to explicitly specify a model profile to enable model services.

```bash
docker compose --profile model up
```

Make sure you have installed [NVIDIA CUDA Driver](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html) and [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html) on host machine.

```bash
# You need set "default-runtime" as "nvidia" in /etc/docker/daemon.json and restart docker to enable NVIDIA Container Toolkit
{
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  },
  "default-runtime": "nvidia"
}
```

If you use **Docker Desktop** + **WSL2.0**, please find this [issue #144](https://github.com/xtreme1-io/xtreme1/issues/144) for your reference.

### Run on ARM CPU

Please note that certain Docker images, including `MySQL`, may not be compatible with the ARM architecture. In case your computer is based on an ARM CPU (e.g. Apple M1), you can create a Docker Compose override file called docker-compose.override.yml and include the following content. While this method uses QEMU emulation to enforce the use of the ARM64 image on the ARM64 platform, it may impact performance.

```yaml
services:
  mysql:
    platform: linux/amd64
```

## Install from Source

If you want to build or extend the function, download the source code and run locally.

### Enable Docker BuildKit

We are using Docker BuildKit to accelerate the building speed, such as cache Maven and NPM packages between builds. By default BuildKit is not enabled in Docker Desktop, you can enable it as follows. For more details, you can check the official document [Build images with BuildKit](https://docs.docker.com/develop/develop-images/build_enhancements/).

```bash
# Set the environment variable to enable BuildKit just for once.
DOCKER_BUILDKIT=1 docker build .
DOCKER_BUILDKIT=1 docker compose up

# Or edit Docker daemon.json to enable BuildKit by default, the content can be something like '{ "features": { "buildkit": true } }'.
vi /etc/docker/daemon.json

# You can clear the builder cache if you encounter some package version related problem.
docker builder prune
```

### Clone Repository

```bash
git clone https://github.com/basicai/xtreme1.git
cd xtreme1
```

### Build Images and Run Services

The `docker-compose.yml` default will pull application images from Docker Hub, if you want to build images from source code, you can comment on the service's image line and un-comment build line.

```yaml
services:
  backend:
    # image: basicai/xtreme1-backend
    build: ./backend
  frontend:
    # image: basicai/xtreme1-frontend
    build: ./frontend
```

Then when you run `docker compose up`, it will first build the `backend` and `frontend` image and start these services. Be sure to run `docker compose build` when code changes, as the up command will only build images when it does not exist.

> You should not commit your change to `docker-compose.yml`, to avoid this, you can copy docker-compose.yml to a new file `docker-compose.develop.yml`, and modify this file as your development needs, as this file is already added into `.gitignore`. And you need to specify this specific file when running Docker Compose commands, such as `docker compose -f docker-compose.develop.yml build`.

# License 
This software is licensed under the Apache 2.0 LICENSE. Xtreme1 is a trademark of LF AI & Data Foundation.

<img src="/docs/images/LFAI_DATA_horizontal-color.png" width="250">

Xtreme1 is now hosted in [LF AI & Data Foundation](https://medium.com/multisensory-data-training/xtreme1-the-first-open-source-labeling-annotation-and-visualization-project-is-debuting-at-the-da1d157d1512) as the 1st open source data labeling annotation and visualization project.


If Xtreme1 is part of your development process / project / publication, please cite us ❤️ :
```bash
@misc{Xtreme1,
title = {Xtreme1 - The Next GEN Platform For Multisensory Training Data},
year = {2023},
note = {Software available from https://github.com/xtreme1-io/xtreme1/},
url={https://xtreme1.io/},
author = {LF AI & Data Foundation},
}
```
