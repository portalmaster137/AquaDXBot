import validateEnv from "./envValidator";
import { Log, ClientSingleton, PrismaSingleton } from "./Globals";
import { registerCommands } from "./commandRegister";

const log = Log;
log.info("Bot Start...");
if (!validateEnv()) {
    log.error("Environment validation failed, exiting...");
    process.exit(1);
}
log.debug("Environment validation passed, connecting to database...");
await PrismaSingleton.$connect();

log.info("Client ready, logging in...");
ClientSingleton.login(process.env.DISCORD_TOKEN);
registerCommands();
