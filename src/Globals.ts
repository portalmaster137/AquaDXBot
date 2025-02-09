import { Client, GatewayIntentBits } from "discord.js";
import { ILogObj, Logger } from "tslog";

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

        this.instance.on("ready", () => {
            LogSingleton.getInstance().info("Client ready.");
        });
    }
}

export { LogSingleton, ClientSingleton };