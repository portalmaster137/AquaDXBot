import { ChatInputCommandInteraction, Interaction } from "discord.js"
import ISlashCommand from "./general"

export default class GamesCommand implements ISlashCommand {
    id = "games"
    
    async execute(interaction: ChatInputCommandInteraction) {
        const game = interaction.options.getString('game');
        if (game) {
            interaction.reply(`You selected the game: ${game}`);
        } else {
            interaction.reply("No game selected.");
        }
    }
}
