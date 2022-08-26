# syntax=docker/dockerfile:1
FROM node:16 as build
WORKDIR /build
COPY . .
RUN yarn && yarn build

FROM tjmehta/node-http-server
WORKDIR /app
COPY --from=build /build/dist ./
EXPOSE 8080
CMD ["http-server", "./"]