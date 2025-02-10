import { LogSingleton } from "./Globals"

export default function validateEnv() {
    const log = LogSingleton.getInstance()
    log.debug("Validating environment variables...")
    if (!process.env.DISCORD_TOKEN) {
        log.error("DISCORD_TOKEN environment variable is required.")
        return false
    }
    return true
}
