import { SlashCommandBuilder } from "discord.js"

const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
    new SlashCommandBuilder()
        .setName("games")
        .setDescription("FAQ for Sega's arcade games")
        .addStringOption(option =>
            option.setName('game')
                .setDescription('Choose what game your running')
                .setRequired(true)
                .addChoices(
                    { name: 'Chunithm', value: 'chuni' },
                    { name: 'maimai', value: 'mai2' },
                    { name: 'Ongeki', value: 'mu3' },
                )),
    new SlashCommandBuilder()
        .setName("test")
        .setDescription("Test embeds"),            
].map(command => command.toJSON());

export default commands;