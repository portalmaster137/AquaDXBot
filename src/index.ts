import validateEnv from "./envValidator"
import { LogSingleton, ClientSingleton, PrismaSingleton } from "./Globals"
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import path from 'path';

const clientId = process.env.CLIENT_ID as string;
const guildId = process.env.GUILD_ID as string;
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9';

const commands: RESTPostAPIApplicationCommandsJSONBody[] = []; // Initialize an empty array for commands

const log = LogSingleton.getInstance();

// Dynamically load commands from the commands directory
const commandsPath = path.join(__dirname, './interactions');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

// Load commands from files in the commands directory
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Load commands from subdirectories in the commands directory
const commandFolders = fs.readdirSync(commandsPath).filter(folder => fs.statSync(path.join(commandsPath, folder)).isDirectory());

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const folderCommandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.ts'));
    for (const file of folderCommandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

(async () => {
    try {
        log.info("Bot Start...");
        if (!validateEnv()) {
            log.error("Environment validation failed, exiting...");
            process.exit(1);
        }
        log.debug("Environment validation passed, connecting to database...");
        await PrismaSingleton.getInstance().$connect();
        log.info("Database connected, setting up client...");
        ClientSingleton.setup();

        log.info("Client ready, logging in...");
        await ClientSingleton.getInstance().login(process.env.DISCORD_TOKEN);

        const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN as string);
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        ) as any[];

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
