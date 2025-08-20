FROM node:20-alpine
WORKDIR /app
# Copy root manifests for workspaces resolution
COPY package.json ./
COPY services/api/package.json ./services/api/package.json
COPY services/worker/package.json ./services/worker/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm install
# Copy the rest of the repo
COPY . .
WORKDIR /app/services/api
EXPOSE 3000
CMD ["npm","run","dev"]
