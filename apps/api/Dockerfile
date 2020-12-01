FROM ozoku/tyko-base:1.0

WORKDIR /workspace

COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/
COPY apps/auth/package.json ./apps/auth/
COPY apps/web/package.json ./apps/web/

RUN yarn install --frozen-lockfile

COPY tsconfig.base.json .

WORKDIR /workspace/apps/api

COPY ./apps/api/src ./src
COPY ./apps/api/tsconfig.json .

RUN yarn build

COPY ./apps/api/ormconfig.json .

EXPOSE 4000

CMD ["yarn", "start"]
