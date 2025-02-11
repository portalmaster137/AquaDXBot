import validateEnv from "./configuration"
import { Log, ClientSingleton, PrismaSingleton } from "./Globals"
import { registerCommands } from "./commandRegister"

Log.debug("Environment validation passed, connecting to database...")
await PrismaSingleton.$connect()

if (process.env.REGISTER_CMDS === "true") {
    await registerCommands()
}

Log.info("Client ready, logging in...")
ClientSingleton.login(process.env.DISCORD_TOKEN)
