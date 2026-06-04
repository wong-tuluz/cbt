FROM node:22-alpine AS Builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_MODE
ENV VITE_MODE=$VITE_MODE

RUN npm run build

FROM node:22-alpine

RUN npm install -g serve

WORKDIR /app

COPY --from=builder /app/dist ./dist
# dev {
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
# }

ENV NODE_ENV=production
ENV PORT=8880

EXPOSE 8880

CMD [ "serve", "-s", "dist" ]
