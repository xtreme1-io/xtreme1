# syntax=docker/dockerfile:1
FROM node:16 as build
WORKDIR /build
COPY . .
RUN apt update && apt install nasm
RUN --mount=type=cache,target=main/node_modules \
    cd main && CPPFLAGS=-DPNG_ARM_NEON_OPT=0 npm install && npm run build
RUN --mount=type=cache,target=image-tool/node_modules \
    cd image-tool && npm install && npm run build
RUN --mount=type=cache,target=pc-tool/node_modules \
    cd pc-tool && npm install && npm run build

FROM tjmehta/node-http-server
WORKDIR /app
COPY --from=build /build/dist ./
EXPOSE 8080
CMD ["http-server", "./"]