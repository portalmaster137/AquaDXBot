import { LogSingleton } from "./Globals";

const log = LogSingleton.getInstance();
export default function validateEnv() {
    log.debug("Validating environment variables...");
    if (!process.env.DISCORD_TOKEN) {
        log.error("DISCORD_TOKEN environment variable is required.");
        return false;
    }




    return true;
}