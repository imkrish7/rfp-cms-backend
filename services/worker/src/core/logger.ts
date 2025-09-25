import pino from "pino";

export const logger = pino({
    customLevels: {
        infoWW: 35,
        info: 30,
        debug: 20,
        error: 50,
        warn: 40,
        fatal: 60,
        trace: 10,
    },
    level: "info",
    useOnlyCustomLevels: false
});