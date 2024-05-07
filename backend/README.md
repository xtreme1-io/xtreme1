# Xtreme1 Backend

## Frameworks and packages

The following frameworks and packages are used.

1. [Spring Boot](https://spring.io/projects/spring-boot) Application framework
1. [MyBatis-Plus](https://baomidou.com/) A powerful enhanced toolkit of MyBatis which is borned to simplify development
1. [Spring Data Redis](https://spring.io/projects/spring-data-redis) Distribute cache
1. [Spring Security](https://spring.io/projects/spring-security) Authenticate and authorize

## Code architecture

![Clean Architecture Optimized](/docs/images/clean-architecture-opt.png?raw=true)

This application uses an optimized clean architecture inspired from [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), it's simpler than the original one. The most important rule of clean architecture is that only outter layer can dependent on inner layer, the reverse does not allowed. To achieve this goal, we need to create interfaces for all outside dependencies used in usecase layer, and implement all these interfaces in adapter layer.

## Directory structure

```
.
├── adapter // Adapter layer
│   ├── Application.java // Application entry
│   ├── api // API for frontend
│   ├── dto // Data transfer objects
│   ├── exception // Exceptions occur in adapter layer
│   └── port // Outside dependencies used in adapter layer, including implementations of interfaces defined in usecase layer
├── entity // Entity layer
├── usecase // Usecase layer
│   ├── ...
│   ├── UserUseCase.java // Usecases for user module
│   ├── exception // Exceptions occur in usecase layer
│   └── port // Interfaces of outside dependencies used in usecase layer, such as persisting data, sending email, etc.
└── util // Business irrelevant tools
```

> For database access, as we are not intend to replace mysql database or mybatis framework, and there are too many interfaces to define, so we let usecase layer to directly call DAO (Data Access Object) in adapter layer.

## Local development

To build and run this application, you need to install Java 11+ and Maven 3.8+. 

### Clone repository

```bash
git clone https://github.com/xtreme1-io/xtreme1.git
cd xtreme1
```

### Prepare base services

This application need some base services, including MySQL, Redis and MinIO. You can start these base services using the included Docker Compose file `docker-compose.yml`, or use your existing base services. 

Run the following command to start base services by Docker Compose.

```bash
docker compose up
```

### Prepare local configuration file

The default configuration file `backend/src/main/resources/application.yml` is just for running by Docker Compose, the addresses of all base services are only accessible in Docker Compose's internal network. For local development, you need to change all these addresses to `localhost` and corresponding mapping port, or the addresses of your existing base services. It's recommend to create a new local configuration file `backend/src/main/resources/application-local.yml` to override the default one. 

Following is an example local configuration file, you can change the address, username and password as your need.

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:8191/xtreme1
    username: xtreme1
    password: Rc4K3L6f
  redis:
    host: localhost
    port: 8192
    password:
    database: 0

minio:
  # Also change the proxy_pass address for location /minio/ in nginx configuration file if you not use the Docker Compose MinIO service.
  endpoint: http://localhost:8193/
  accessKey: admin
  secretKey: 1tQB970y
  bucketName: xtreme1
```

If you choose to use your existing services, you should init these services manually. For mysql, execute sql files under directory `deploy/mysql/migration` to create tables and insert initial data. For nginx, you should configure a virtual server like `deploy/nginx/conf.d/default.conf`. For more infomation, you can reference the Docker Compose file.

### Build and run

You can build and run this application in your favorite IDE, such as Intellij IDEA, make sure to enable `local` profile.

![Run in IDEA](/docs/backend/images/idea-run-local.png)

Or run in terminal.

```bash
cd backend
# Build jar package.
mvn package
# Run application with local configuration.
java -Dspring.profiles.active=local -jar target/xtreme1-backend-x.y.z-SNAPSHOT.jar
```

Now you can access the backend service at `http://localhost:8080/`.

## Coding standards

### Auto format

Recommend to use IDEA's auto format function, go to `Settings->Editor->Code Style->Java`, click `Configure Icon->Import Scheme->IntelliJ IDEA code style XML`, and select code style file `backend/coding-standards/intellij-code-format.xml`.

Configure auto format on save as following, check `Reformat code`, `Optimize imports` and `Rearrange code`.

![Actions on Save](/docs/backend/images/idea-save-actions.png)

### Check style

Xtreme1 backend use [Checktyle](https://github.com/checkstyle/checkstyle) to check code style, for IDEA please install `Checkstyle-IDEA` plugin first, go to `Settings->Tools->Checkstyle`, and create a new configuration file by using the local checkstyle file `backend/coding-standards/checkstyle.xml`.

![Configure Checkstyle](/docs/backend/images/idea-checkstyle-configure.png)

Then you can run Checkstyle to check code style.

![Run Checkstyle](/docs/backend/images/idea-checkstyle-run.png)

> Right now the code style is not forced, but in the future it will be forced by using GitHub's CI pipeline.
