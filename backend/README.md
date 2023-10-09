# Xtreme1 Backend

## Application Architecture and Framework

![Clean Architecture Optimized](/docs/images/clean-architecture-opt.png?raw=true)

This application uses an optimized clean architecture inspiration from [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), it's simpler than the original one. The most important rule of clean architecture is that only outter layer can dependent on inner layer, the reverse does not allowed. To achieve this goal, we need to create interfaces for all outside dependencies used in usecase layer, and implement all these interfaces in adapter layer.

We use the following main frameworks and packages.

1. [Spring Boot](https://spring.io/projects/spring-boot) Web framework and server
1. [MyBatis](https://mybatis.org/) SQL Mapping Framework
1. [MyBatis-Plus](https://baomidou.com/) An powerful enhanced toolkit of MyBatis for simplify development
1. [Spring Data Redis](https://spring.io/projects/spring-data-redis) Cache data
1. [Spring Security](https://spring.io/projects/spring-security) Authenticate and authrorize

## Directory Structure

```
.
├── adapter // Adapter layer
│   ├── Application.java // Application entry
│   ├── api // Apis for frontend
│   ├── dto // Data transfer objects
│   ├── exception // Exceptions occur in adapter layer
│   └── port // Outside dependencies used in adapter layer, including implementations of interfaces defined in usecase layer
├── entity // Entity layer
├── usecase // Usecase layer
│   ├── ...
│   ├── UserUseCase.java // Usecase for user module
│   ├── exception // Exceptions occur in usecase layer
│   └── port // Interfaces of outside dependencies used in usecase layer, such as persistence data, sending email, etc.
└── util // Business irrelevant tools
```

> For database access, as we are not intend to replace mysql database and mybatis framework, and there are too many interfaces to define, so we let usecase layer to directly call daos (Data Access Objects) in adapter layer.

## Local development

To build and run this application, you need to have Java 11 and Maven 3.8 installed first, or the newer but not tested. 

### Clone repository

```bash
git clone https://github.com/basicai/xtreme1.git
cd xtreme1
```

###  Prepare base services

This application need base services, including MySQL, Redis and MinIO. You can use your existing base services, or start these base services using Docker Compose. To start base services by Docker Compose, you can use the following commands, refrence the top level README to get more. You can skip this step if you decide to using your existing base services.

```bash
docker compose up
```

###  Prepare local configuration

For using base services started by Docker Compose, you can save the following content in a local configuration file to path `backend/src/main/resources/application-local.yml`. You can change the address, username and password of any base service as your need, such as using an existing one.

```yaml
debug: false

spring:
  datasource:
    url: jdbc:mysql://localhost:8191/x1_community
    username: x1_community
    password: Rc4K3L6f
  redis:
    host: localhost
    port: 8192
    password:

minio:
  internalEndpoint: http://localhost:8193/
  endpoint: http://localhost:8193/
  accessKey: admin
  secretKey: 1tQB970y

```

If you choose to use your existing services, be sure to init these services, for MySQL you need to create tables and init data, for MinIO you need to create the default bucket. For more infomation you can reference the top level Docker Compose file, it will auto do these jobs when starting these services by Docker Compose.

### Build and run

You can build and run this application in your favorite IDE, such as Intellij IDEA, or exetute the following commands in terminal. 

```bash
cd backend

# Bulding jar package.
mvn package

# Using local configuration to start application.
java -Dspring.profiles.active=local -jar target/xtreme1-backend-0.7.2-SNAPSHOT.jar
```

Now you can access the backend service at `http://localhost:8080/`.

## Coding Standards

The code you contribute should follow the guidelines of [Alibaba Java Coding Guidelines](https://github.com/alibaba/Alibaba-Java-Coding-Guidelines). There also have checking plugins for most popular IDEs, such as Intellij IDEA, VS Code etc., you can search "Alibaba Java Coding Guidelines" in each's IDE's plugin repository. There should be no `BLOCKER` and `CRITICAL` error in the code you contribute, excepting for naming error like `DTO`, `BO` etc.
