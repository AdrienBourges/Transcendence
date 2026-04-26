FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY public ./public
COPY src ./src

ARG VITE_OAUTH42_CLIENT_ID
ARG VITE_OAUTH42_REDIRECT_URI
ARG VITE_API_URL
ENV VITE_OAUTH42_CLIENT_ID=$VITE_OAUTH42_CLIENT_ID
ENV VITE_OAUTH42_REDIRECT_URI=$VITE_OAUTH42_REDIRECT_URI
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build
