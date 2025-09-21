import pino from "pino";

export const logger =  pino({ level: "info", msgPrefix: '[shared] ', transport: { target: 'pino-pretty' } });

