import { ChatInputCommandInteraction } from "discord.js";
import ISlashCommand from "./general";
import embeds from "../embed"; // Import the embeds

export default class TestEmbedCommand implements ISlashCommand {
    id = "test";
    
    async execute(interaction: ChatInputCommandInteraction) {
        const embed = embeds.testEmbed; // Use the testEmbed
        await interaction.reply({ embeds: [embed] });
    }
}
