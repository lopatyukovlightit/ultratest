FROM node:9-alpine
RUN apk add --no-cache bash

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
RUN npm install

COPY . .
