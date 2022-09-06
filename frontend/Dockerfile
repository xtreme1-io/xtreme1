# syntax=docker/dockerfile:1
FROM node:16 as build
WORKDIR /build
COPY . .
RUN --mount=type=cache,target=main/node_modules \
    cd main && yarn install && npm run build
RUN --mount=type=cache,target=image-tool/node_modules \
    cd image-tool && yarn install && npm run build
RUN --mount=type=cache,target=pc-tool/node_modules \
    cd pc-tool && yarn install && npm run build

FROM tjmehta/node-http-server
WORKDIR /app
COPY --from=build /build/dist ./
EXPOSE 8080
CMD ["http-server", "./"]