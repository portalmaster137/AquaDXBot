import { Client, GatewayIntentBits } from "discord.js"
import { ILogObj, Logger } from "tslog"
import ISlashCommand from "./interactions/general"
import PingCommand from "./interactions/ping"
import { Prisma, PrismaClient } from "@prisma/client"
import Configuration from "./configuration"

const minLevel = Configuration.emit.log_level

export const Log = new Logger<ILogObj>({ minLevel }),
    PrismaSingleton = new PrismaClient(),
    ClientSingleton = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    }),
    commands: Record<string, ISlashCommand> = {}

commands.ping = new PingCommand()

ClientSingleton.on("ready", () => {
    Log.info("Client ready.")
})

ClientSingleton.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return

    const command = commands[interaction.commandName]

    if (!command) {
        Log.warn(`Command ${interaction.commandName} not found.`)
        interaction.reply({
            content: "Command not found.",
            ephemeral: true,
        })
        return
    }

    if (interaction.isChatInputCommand()) {
        command.execute(interaction)
    } else {
        Log.warn(`Interaction type ${typeof interaction} not supported.`)
        interaction.reply({
            content: "Interaction type not supported.",
            ephemeral: true,
        })
    }
})
