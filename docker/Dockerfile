FROM node:24-alpine AS base

RUN npm i -g pnpm@10
ENV CI=true

WORKDIR /app

COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json nx.json ./
COPY ./packages/cbt-front/package.json ./packages/cbt-front/
COPY ./packages/cbt-server/package.json ./packages/cbt-server/

RUN pnpm install --frozen-lockfile




FROM base AS front-build

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY ./packages/cbt-front /app/packages/cbt-front
RUN pnpm nx run cbt-front:build




FROM base AS printing-build

COPY ./packages/cbt-server /app/packages/cbt-server
RUN pnpm nx run cbt-server:build
RUN pnpm --filter cbt-server --prod --no-optional deploy /app/dist/cbt-server




FROM node:24-alpine AS cbt-server

WORKDIR /app

ENV VITE_API_URL='/api'

COPY ./packages/cbt-server/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

COPY --chown=1000 --from=printing-build /app/dist/cbt-server/dist /app/dist
COPY --chown=1000 --from=printing-build /app/dist/cbt-server/node_modules /app/node_modules

# COPY --chown=1000 --from=printing-build /app/dist/cbt-server/drizzle /app/drizzle
COPY --chown=1000 --from=printing-build /app/dist/cbt-server/package.json /app/

USER 1000

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/src/main"]




FROM cbt-server AS integral-erp

COPY --chown=1000 --from=front-build /app/packages/cbt-front/dist /app/dist/public

USER 1000

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/src/main"]
