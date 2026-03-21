FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY server/package.json ./server/package.json

RUN npm ci --workspace=server

COPY server ./server

WORKDIR /app/server

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
