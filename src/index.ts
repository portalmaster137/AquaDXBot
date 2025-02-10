import { configDotenv } from "dotenv";
import validateEnv from "./envValidator";
import { LogSingleton, ClientSingleton, PrismaSingleton } from "./Globals";

const log = LogSingleton.getInstance();
log.info("Bot Start...");
configDotenv
if (!validateEnv()) {
    log.error("Environment validation failed, exiting...");
    process.exit(1);
}
log.debug("Environment validation passed, connecting to database...");
await PrismaSingleton.getInstance().$connect();
log.info("Database connected, setting up client...");
ClientSingleton.setup();

log.info("Client ready, logging in...");
ClientSingleton.getInstance().login(process.env.DISCORD_TOKEN);