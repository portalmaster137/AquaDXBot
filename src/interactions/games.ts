import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import ISlashCommand from "./general";

export default class GamesCommand implements ISlashCommand {
    id = "games";
    
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();
        const option = interaction.options.getString('option');
        let replyMessage = "";

        switch (subcommand) {
            case 'chuni':
                replyMessage = this.handleChuni(option);
                break;
            case 'mai2':
                replyMessage = this.handleMai2(option);
                break;
            case 'mu3':
                replyMessage = this.handleMu3(option);
                break;
            default:
                replyMessage = "Unknown game selected.";
                break;
        }

        await interaction.reply(replyMessage);
    }

    handleChuni(option: string | null): string {
        switch (option) {
            case 'oldest':
                return "Chunithm oldest supported version: Chunithm NEW!! (1.00)";
            case 'newest':
                return "Chunithm newest supported version: Chunithm LUMINOUS PLUS (2.27)";
            case 'faq':
                return "Chunithm FAQ...";
            default:
                return "Unknown option selected for Chunithm.";
        }
    }

    handleMai2(option: string | null): string {
        switch (option) {
            case 'oldest':
                return "maimai oldest supported version: maimai DX (1.00)";
            case 'newest':
                return "maimai newest supported version: maimai DX Prism (1.50)";
            case 'faq':
                return "maimai FAQ...";
            default:
                return "Unknown option selected for maimai.";
        }
    }

    handleMu3(option: string | null): string {
        switch (option) {
            case 'oldest':
            return "Ongeki oldest supported version: O.N.G.E.K.I. (1.00)";
            case 'newest':
                return "Ongeki newest supported version: O.N.G.E.K.I. bright MEMORY (1.40)";
            case 'faq':
                return "Ongeki FAQ...";
            default:
                return "Unknown option selected for Ongeki.";
        }
    }
}
