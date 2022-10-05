<div align="center">
<img width="386" alt="Xtreme1 logo" src="https://user-images.githubusercontent.com/84139543/190300943-98da7d5c-bd67-4074-a94f-b7405d29fb90.png">

![](https://img.shields.io/badge/Release-v0.5.1-green) 
![](https://img.shields.io/badge/License-Apache%202.0-blueviolet)
<a href="https://join.slack.com/share/enQtNDA4MjA4MzEwNjg1Mi04ZDc1NmI4YzMxNjgyYWRhZGExMzM1NzllZTQ3Yzk5ZjAzZWQ4MWM5ZjNiZmQ0OGE2YzU5YTkwZGIzNTc5ZGMz" alt="Join Slack">
<img src="https://img.shields.io/static/v1?label=Join&message=Slack&color=ff69b4" /></a>
<a href="https://twitter.com/BasicAIteam" alt="Follow Twitter"><img src="https://img.shields.io/badge/Follow-Twitter-blue" /></a>
<a href="https://app.basic.ai/#/login" alt="app">
<img src="https://img.shields.io/badge/Xtreme1-App-yellow" /></a>    
[![Docs](https://img.shields.io/badge/Docs-Stable-success.svg?style=flat&longCache=true)](http://docs.basic.ai/)
</div>


## 简介
BasicAI发布了全球首个开源多模态训练数据平台Xtreme1！
Xtreme1深入AI工程化，致力于解决数据集在数据标注、数据监管和本体库管理的挑战。无论是2D和3D数据集的目标检测、场景分割或多传感器融合数据集，强大的工具和AI模型都能加快模型落地的速度。

## 加入社区
[Website](https://basic.ai) | [Slack](https://join.slack.com/share/enQtNDA4MjA4MzEwNjg1Mi04ZDc1NmI4YzMxNjgyYWRhZGExMzM1NzllZTQ3Yzk5ZjAzZWQ4MWM5ZjNiZmQ0OGE2YzU5YTkwZGIzNTc5ZGMz) | [Twitter](https://twitter.com/BasicAIteam) |  [LinkedIn](https://www.linkedin.com/company/basicaius/about/?viewAsMember=true) | [Issues](https://github.com/basicai/xtreme1/issues)

欢迎加入社区生态！任何使用上的问题和建议，可以通过issue反馈给开发者！

👉 加入中文微信技术交流群！（添加小助理X星人的微信：`xtreme1_ai`）


## 功能亮点
图片矩形框标注—目标检测模型  | 图片分割标注—实例分割模型（YOLOR）
------------- | -------------
![](/docs/images/image-bbox-model.gif)  |  ![](/docs/images/2d-seg-model.gif)

1️⃣ 支持对图片、3D点云和融合数据集进行标注
2️⃣ 内置预处理模型支持目标检测、场景分割与分类
3️⃣ 可自主配置的本体中心
4️⃣ 数据集管理和质量监控
5️⃣ 查找并改正标注错误
6️⃣ 模型结果可视化，模型评估
点云3D立体框标注——LiDAR数据3D目标检测模型  | 点云3D立体框跟踪——LiDAR数据3D目标跟踪模型
------------- | -------------
![](/docs/images/3d-annotation.gif)  |  ![](/docs/images/3d-track-model.gif)

## 快速安装
- 无需任何安装,抢先[体验在线版](https://app.basic.ai/#/login/) 🚀
- * [快速安装启动Xtreme1](#安装并运行Xtreme1) :cd:
- * [使用源代码构建Xtreme1](#build-xtreme1-from-source-code) :wrench:

### 安装并运行Xtreme1
----
#### 环境要求
**操作系统要求**
所有操作系统都可使用Docker Compose安装Xtreme1（在Mac，Windows和Linux设备上安装[Docker Desktop](https://docs.docker.com/desktop/) ）。如果您使用Linux服务器，可以通过[Docker Compose Plugin](https://docs.docker.com/compose/install/linux/)安装Docker Engine。

**硬件要求**
| 组件 | 推荐配置 |
| ------ | ------ |
| CPU | AMD64 或 ARM64 |
| 内存 | 2GB或以上 |
| 硬盘 | 10GB或以上 (取决于数据量) |

**软件要求**
针对Mac，Windows和Linux桌面操作系统
| 软件 | 版本 |
| ------ | ------ |
| Docker Desktop | 4.1或以上 |

Linux服务器：
| 软件 | 版本 |
| ------ | ------ |
| Docker Engine | 20.10或以上 |
| Docker Compose Plugin | 2.0或以上 |

**⚠️（内置）模型部署要求**
目前模型服务只适用于安装了[NVIDIA Driver](https://docs.nvidia.com/datacenter/tesla/tesla-installation-notes/index.html)和[NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker)的Linux服务器。
| 组件 | 推荐配置 |
| ------ | ------ |
| GPU | Nvidia Tesla T4或类似的Nvidia GPU |
| GPU内存 | 6GB或更高 |
| 内存 | 4GB或更高 |

#### 下载发布包
单击Repository主页右侧Releases，选择`xtreme1-<version>.zip`名称的压缩包，下载并解压。您也可以用以下命令行下载安装包并解压，请将版本号替换为最新。
```bash
wget https://github.com/basicai/xtreme1/releases/download/v0.5.1/xtreme1-v0.5.1.zip
unzip -d xtreme1-v0.5.1 xtreme1-v0.5.1.zip
```

#### 启动所有服务
打开目录，执行以下命令启动所有服务，这里需要几分钟时间初始化数据库并准备测试数据集，如果控制台显示一切正常，您可以在在浏览器中打开`http://localhost:8190`(推荐使用Google Chrome浏览器)如果您想从另一台计算机访问，您可以将 localhost 替换为 ip 地址。

```bash
docker compose up
```

> ⚠️部分Docker镜像，如MySQL,不支持ARM平台。如果您的电脑使用的是ARM架构的CPU，例如Apple M1，可以使用 Docker Compose 覆盖文件docker-compose.override.yml来覆盖默认配置。
它会通过QEMU强制在ARM64平台上运行amd64镜像，不过这种方式会影响到性能。

```yaml
services:
  mysql:
    platform: linux/amd64
```

<img src="https://www.basic.ai/_nuxt/img/4f457dd.png" alt="xtreme1_lidar_page">

#### Docker Compose高级命令

```bash
# 前台运行
docker compose up
# 使用-d选项来在后台运行
docker compose up -d
# 启动或停止所有服务或特定服务
docker compose start
docker compose stop
# 停止服务并删除所有容器，但保留数据
docker compose down
# 删除数据，您将丢失MySQL, Redis和Minio内所有数据，请谨慎操作！
docker compose down -v
```

Docker Compose将从Docker Hub拉起所有服务，包括基础服务MySQL，Redis，Minio和应用服务backend，frontend。您可以在docker-compose.yml文件中找到用于访问MySQL，Redis，Minio的用户名、密码及绑定端口。例如，您可以通过http://localhost:8194访问MinIO控制台。我们使用Docker Volume来保存数据，因此当您重新创建容器时不会丢失任何数据。

#### 启动模型服务
需要明确指定模型 Profile 来启用模型服务
docker compose --profile model up
>请确保您已安装NVIDIA Driver和 NVIDIA Container Toolkit。模型镜像已包含CUDA Toolkit，您无需安装。

## 使用源代码构建Xtreme1
### 启用Docker BuildKit
本平台使用 Docker BuildKit 来加快构建速度，例如在每个构建之间缓存Maven和NPM包。 默认情况下，Docker Desktop中未启用BuildKit，您可以按照以下方式启用它。 查看官方文档Build images with BuildKit了解更多细节。

```bash
# 设置环境变量，仅对本次运行生效
DOCKER_BUILDKIT=1 docker build .
DOCKER_BUILDKIT=1 docker compose up
# 编辑Docker daemon.json默认启用BuildKit，内容为 '{ "features": { "buildkit": true } }'
vi /etc/docker/daemon.json
# 如果遇到依赖包相关问题，可以清空构建缓存
docker builder prune
```

### 克隆仓库

```bash
git clone https://github.com/basicai/xtreme1.git
cd xtreme1
```

### 构建镜像并运行服务
docker-compose.yml文件默认会从 Docker Hub 拉取应用程序镜像，如果你想从源代码构建镜像，你可以注释掉远程镜像拉取，并启用本地镜像构建。

```bash
services:
  backend:
    # image: basicai/xtreme1-backend
    build: ./backend
  frontend:
    # image: basicai/xtreme1-frontend
    build: ./frontend
```

接下来，当你运行`docker compose up`时，它会首先构建`backend`和`frontend`镜像并启动服务。请确保在代码更改时运行`docker compose build`，因为 up 命令只会在镜像不存在时构建镜像。
> 请勿直接修改`docker-compose.yml`文件，您可以复制`docker-compose.yml`至新文件`docker-compose.develop.yml`,并在新文件上根据开发需求修改，该文件已添加到'.gitignore'。在运行Docker Compose命令时请指定该文件，比如`docker compose -f docker-compose.develop.yml build`。

了解更多开发指南，可点击进入相应应用服务文件夹下查阅其ReadMe文档。

# 许可证书
本软件根据Apache2.0许可 @BasicAI
如果 Xtreme1 是您的开发过程/项目/发布的一部分，请标明引用❤️：

```bash
@misc{BasicAI,
title = {Xtreme1 - The Next GEN Platform For Multisensory Training Data},
year = {2022},
note = {Software available from https://github.com/basicai/xtreme1/},
url={https://basic.ai/},
author = {BasicAI},
}
```
