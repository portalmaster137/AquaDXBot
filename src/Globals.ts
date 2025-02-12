import { Client, GatewayIntentBits } from "discord.js"
import { ILogObj, Logger } from "tslog"
import ISlashCommand from "./interactions/general"
import PingCommand from "./interactions/ping"
import GamesCommand from "./interactions/games"
import TestEmbedCommand from "./interactions/test" 
import { Prisma, PrismaClient } from "@prisma/client"

const minLevel = (() => {
    const logLevel: string = process.env.LOG_LEVEL?.toLowerCase() || "info"
    switch (logLevel) {
        case "silly":
            return 0
        case "trace":
            return 1
        case "debug":
            return 2
        case "info":
            return 3
        case "warn":
            return 4
        case "error":
            return 5
        case "fatal":
            return 6
        default:
            return 3
    }
})()

export const Log = new Logger<ILogObj>({ minLevel }),
    PrismaSingleton = new PrismaClient(),
    ClientSingleton = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    }),
    commands: Record<string, ISlashCommand> = {}

commands.ping = new PingCommand()
commands.games = new GamesCommand()
commands.test = new TestEmbedCommand()

ClientSingleton.on("ready", () => {
    Log.info("Client ready.")
})

ClientSingleton.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) {
      return
    }

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
