import pino from "pino";

export const logger = pino({msgPrefix: "[SOCKET] ", transport: { target: 'pino-pretty' }})