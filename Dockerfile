FROM node:12-alpine

WORKDIR /workspace

COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/
COPY apps/auth/package.json ./apps/auth/
COPY apps/web/package.json ./apps/web/

RUN yarn install --frozen-lockfile

COPY tsconfig.base.json .
