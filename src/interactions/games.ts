import { ChatInputCommandInteraction } from "discord.js";
import ISlashCommand from "./general";

export default class GamesCommand implements ISlashCommand {
    id = "games";
    
    async execute(interaction: ChatInputCommandInteraction) {
        const game = interaction.options.getString('game');
        let replyMessage = "";

        if (game) {
            switch (game) {
                case 'chuni':
                    replyMessage = "You selected Chunithm! Chunithm is a rhythm game developed by Sega. Latest Supported Version: Luminous Plus (2.27)";
                    break;
                case 'mai2':
                    replyMessage = "You selected maimai! maimai is a rhythm game developed by Sega. Latest Supported Version: maimai DX Prism (1.50) ";
                    break;
                case 'mu3':
                replyMessage = "You selected Ongeki! Ongeki is a rhythm game developed by Sega. Latest Supported Version: Ongeki Bright Memories (1.45)";
                    break;
                default:
                    replyMessage = "Unknown game selected.";
                    break;
            }
        } else {
            replyMessage = "No game selected.";
        }

        await interaction.reply(replyMessage);
    }
}