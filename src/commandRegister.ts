import { REST, Routes, SlashCommandBuilder } from "discord.js"
import validateEnv from "./envValidator"
import { Log } from "./Globals"
validateEnv()

const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
].map(command => command.toJSON())

const rest = new REST().setToken(process.env.DISCORD_TOKEN as string)

export async function registerCommands() {
    (async () => {
        try {

            Log.info(
                "Started refreshing application (/) commands."
            )

            if (process.env.WIPE_OLD_COMMANDS === "true") {
                await rest.put(Routes.applicationCommands(process.env.CLIENT_ID as string), {body : []})
                await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD_ID as string), {body : []})
            }

            const data = await rest.put(
                Routes.applicationGuildCommands(
                    process.env.CLIENT_ID as string,
                    process.env.GUILD_ID as string
                ),
                { body: commands }
            )

            Log.info(
                "Successfully reloaded application (/) commands."
            )

        } catch (error) {
            Log.error(error)
        }
    })()
}

