import { Log } from "./Globals"

export default function validateEnv() {
    Log.debug("Validating environment variables...")
    if (!process.env.DISCORD_TOKEN) {
        Log.error("DISCORD_TOKEN environment variable is required.")
        return false
    }
    return true
}
