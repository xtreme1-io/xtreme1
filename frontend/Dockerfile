# syntax=docker/dockerfile:1
FROM node:16 as build
WORKDIR /build
COPY . .
RUN --mount=type=cache,target=main/node_modules \
    cd main && npm install && npm run build
RUN --mount=type=cache,target=image-tool/node_modules \
    cd image-tool && npm install && npm run build
RUN --mount=type=cache,target=pc-tool/node_modules \
    cd pc-tool && npm install && npm run build
RUN --mount=type=cache,target=text-tool/node_modules \
    cd text-tool && npm install && npm run build

FROM nginx:1.22
COPY --from=build /build/dist /usr/share/nginx/html
