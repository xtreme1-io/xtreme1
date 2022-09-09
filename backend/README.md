# Xtreme1 Backend

## Application Architecture and Framework

![Clean Architecture Optimized](/docs/images/clean-architecture-opt.png?raw=true)

This application uses an optimized clean architecture inspiration from [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), it's much simpler than the original one. The most important rule of clean architecture is that only outter layer can dependent on inner layer, the reverse does not allowed. To achieve this goal, we need to create interfaces for all outside dependencies used in usecase layer, and implement all these interfaces in adapter layer.

## Directory Structure

```
.
├── adapter
│   ├── Application.java
│   ├── api
│   │   ├── annotation
│   │   ├── config
│   │   ├── context
│   │   ├── controller
│   │   ├── filter
│   │   └── job
│   ├── dto
│   │   ├── ...
│   │   ├── UserDTO.java
│   │   ├── request
│   │   └── response
│   ├── exception
│   │   └── ApiException.java
│   └── port
│       ├── dao
│       ├── minio
│       └── rpc
├── entity
│   ├── ...
│   ├── UserBO.java
│   └── enums
├── usecase
│   ├── ...
│   ├── UserUseCase.java
│   └── exception
│       ├── UsecaseCode.java
│       └── UsecaseException.java
└── util
```

## Build and Run

### Build

Development environment fro buiding this project.

### Run

Run and debug application.

## Coding Standards
