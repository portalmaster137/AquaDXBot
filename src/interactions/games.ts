import { ChatInputCommandInteraction, Interaction } from "discord.js"
import ISlashCommand from "./general"

export default class GamesCommand implements ISlashCommand {
    id = "games"
    async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply("Pong!")
    }
}