FROM ozoku/tyko-base:1.0

WORKDIR /workspace

COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/
COPY apps/auth/package.json ./apps/auth/
COPY apps/web/package.json ./apps/web/

RUN yarn install --frozen-lockfile

COPY tsconfig.base.json .

WORKDIR /workspace/apps/web

COPY ./apps/web/components ./components
COPY ./apps/web/gql ./gql
COPY ./apps/web/hooks ./hooks
COPY ./apps/web/lib ./lib
COPY ./apps/web/pages ./pages
COPY ./apps/web/public ./public
COPY ./apps/web/.graphql-let.yml .
COPY ./apps/web/next-env.d.ts .
COPY ./apps/web/next.config.js .
COPY ./apps/web/tsconfig.json .

ENV NEXT_PUBLIC_API_SERVER=https://tavastia.nrth.xyz/api
ENV NEXT_PUBLIC_AUTH_SERVER=https://tavastia.nrth.xyz

RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]
