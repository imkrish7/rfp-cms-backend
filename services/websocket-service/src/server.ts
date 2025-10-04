import { logger } from "./core/logger";
import { server } from "./app";
import "./socket"

const PORT = 4004

server.listen(PORT, () => {
    logger.info(`WebSocket service running on port ${PORT}`)
})