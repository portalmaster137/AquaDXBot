import { Client, GatewayIntentBits } from "discord.js";
import { ILogObj, Logger } from "tslog";
import ISlashCommand from "./interactions/general";
import PingCommand from "./interactions/ping";
import { PrismaClient } from "@prisma/client";

const minLevel = (() => {
    const logLevel: string = process.env.LOG_LEVEL?.toLowerCase() || "info";
    switch (logLevel) {
        case "silly": return 0;
        case "trace": return 1;
        case "debug": return 2;
        case "info": return 3;
        case "warn": return 4;
        case "error": return 5;
        case "fatal": return 6;
        default: return 3;
    }
})();

class LogSingleton {
    private static instance: Logger<ILogObj>;

    private constructor() {}

    public static getInstance(): Logger<ILogObj> {
        if (!LogSingleton.instance) {
            LogSingleton.instance = new Logger<ILogObj>({ minLevel: minLevel });
        }
        return LogSingleton.instance;
    }
}

class ClientSingleton {
    private static instance: Client;
    private constructor() {}
    private static commands: ISlashCommand[] = [];

    private static ensureInstance() {
        if (!ClientSingleton.instance) {
            ClientSingleton.instance = new Client({
                intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
            });
        }
    }

    public static getInstance(): Client {
        this.ensureInstance();
        return ClientSingleton.instance;
    }

    public static setup() {
        this.ensureInstance();

        this.commands.push(new PingCommand());

        this.instance.on("ready", () => {
            LogSingleton.getInstance().info("Client ready.");
        });

        this.instance.on('interactionCreate', async (interaction)=>{
            if (!interaction.isCommand()) return;
            const command = this.commands.find(command => command.id === interaction.commandName);
            if (!command) {
                LogSingleton.getInstance().warn(`Command ${interaction.commandName} not found.`);
                interaction.reply({content: "Command not found.", ephemeral: true});
                return;
            }
            if (interaction.isChatInputCommand()) {
                command.execute(interaction);
            } else {
                LogSingleton.getInstance().warn(`Interaction type ${typeof interaction} not supported.`);
                interaction.reply({ content: "Interaction type not supported.", ephemeral: true });
            }
        })
    }
}

class PrismaSingleton {
    private static instance: PrismaClient;
    private constructor() {}

    private static ensureInstance() {
        if (!PrismaSingleton.instance) {
            PrismaSingleton.instance = new PrismaClient();
        }
    }

    public static getInstance(): PrismaClient {
        this.ensureInstance();
        return PrismaSingleton.instance;
    }
}

export { LogSingleton, ClientSingleton, PrismaSingleton };