import {
    ChatInputCommandInteraction,
    Interaction,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction,
} from "discord.js"

export default interface ISlashCommand {
    id: string
    execute: (interaction: ChatInputCommandInteraction) => void
}
