FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY client/package.json ./client/package.json

RUN npm ci --workspace=client

COPY client ./client

EXPOSE 5173

CMD ["npm", "run", "dev", "--workspace=client", "--", "--host", "0.0.0.0", "--port", "5173"]
