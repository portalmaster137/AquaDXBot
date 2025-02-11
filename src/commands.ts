import { SlashCommandBuilder } from "discord.js";

const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
    new SlashCommandBuilder()
        .setName("games")
        .setDescription("FAQ for segas arcade games")
].map(command => command.toJSON());

export default commands;