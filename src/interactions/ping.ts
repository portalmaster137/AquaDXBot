import { ChatInputCommandInteraction, Interaction } from "discord.js"
import ISlashCommand from "./general"

export default class PingCommand implements ISlashCommand {
    id = "ping"
    async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply("Pong!")
    }
}
