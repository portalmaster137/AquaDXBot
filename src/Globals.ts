import { ILogObj, Logger } from "tslog";

// Check for "LOG_LEVEL" environment variable
const logLevel: string = process.env.LOG_LEVEL?.toLowerCase() || "info";
const minLevel = (() => {
    switch (logLevel) {
        case "silly": return 0;
        case "trace": return 1;
        case "debug": return 2;
        case "info": return 3;
        case "warn": return 4;
        case "error": return 5;
        case "fatal": return 6;
        default: return 3;
    }
})();

const log: Logger<ILogObj> = new Logger<ILogObj>({minLevel: minLevel});

export { log };