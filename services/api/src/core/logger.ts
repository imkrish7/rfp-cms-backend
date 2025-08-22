import pino from "pino";
import pinoHttp from "pino-http";

export const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug", msgPrefix: '[HTTP] ', transport: { target: 'pino-pretty' } });
export const loggerMiddleware = pinoHttp({ logger: logger as unknown as import("pino").Logger })