FROM ozoku/tyko-base:1.0

WORKDIR /workspace

COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/
COPY apps/auth/package.json ./apps/auth/
COPY apps/web/package.json ./apps/web/

RUN yarn install --frozen-lockfile

COPY tsconfig.base.json .

WORKDIR /workspace/apps/auth

COPY ./apps/auth/src ./src
COPY ./apps/auth/tsconfig.json .

RUN yarn build

COPY ./apps/auth/public ./public
COPY ./apps/auth/views ./views
COPY ./apps/auth/ormconfig.json .

EXPOSE 4000

CMD ["yarn", "start"]
