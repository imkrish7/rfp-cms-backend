FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY services/worker/package.json ./services/worker/package.json
COPY services/api/package.json ./services/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm install
COPY . .
WORKDIR /app/services/worker
CMD ["npm","run","dev"]
