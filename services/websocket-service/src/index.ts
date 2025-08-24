import express from "express"
import http from "http"
import { logger } from "./core/logger";

const PORT = 4000

const app = express();
const server = http.createServer(app);


server.listen(PORT, () => {
    logger.info(`WebSocket service running on port ${PORT}`)
})