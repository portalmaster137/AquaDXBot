import { configDotenv } from "dotenv";
import validateEnv from "./envValidator";
import { log } from "./Globals";

log.info("Bot Start...");
configDotenv();
if (!validateEnv()) {
    log.error("Environment validation failed, exiting...");
    process.exit(1);
}
log.debug("Environment validation passed.");