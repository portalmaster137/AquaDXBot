import { REST, Routes, SlashCommandBuilder } from "discord.js"
import validateEnv from "./envValidator"
import { LogSingleton } from "./Globals"
validateEnv()

const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
].map(command => command.toJSON())

const rest = new REST().setToken(process.env.DISCORD_TOKEN as string)

;(async () => {
    try {
        LogSingleton.getInstance().info(
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
        LogSingleton.getInstance().info(
            "Successfully reloaded application (/) commands."
        )
    } catch (error) {
        LogSingleton.getInstance().error(error)
    }
})()
