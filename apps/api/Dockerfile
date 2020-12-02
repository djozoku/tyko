FROM ozoku/tyko-base:1.0

WORKDIR /workspace/apps/api

COPY ./apps/api/src ./src
COPY ./apps/api/tsconfig.json .

RUN yarn build

COPY ./apps/api/ormconfig.json .

EXPOSE 4000

CMD ["yarn", "start"]
