import { SlashCommandBuilder } from "discord.js";

const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
].map(command => command.toJSON());

export default commands;