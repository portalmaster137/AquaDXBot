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

;(async () => {
    try {
        Log.info("Started refreshing application (/) commands.")
        const data = await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID as string,
                process.env.GUILD_ID as string
            )
        )
        Log.info("Successfully reloaded application (/) commands.", {
            body: data,
        })
    } catch (error) {
        Log.error(error)
    }
})()
