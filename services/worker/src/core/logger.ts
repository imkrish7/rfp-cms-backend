import pino from "pino";

export const logger = pino({ msgPrefix: '[EVENT] ', transport: { target: 'pino-pretty' } });