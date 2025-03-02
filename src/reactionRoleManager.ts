import { Client, Snowflake } from "discord.js"
import { ReactionRole, ReactionRoleConfiguration } from "discordjs-reaction-role"

export const setupReactionRoleManager = (client: Client) => {
    const MESSAGE: Snowflake = process.env.MESSAGE!!;
    const ROLE: Snowflake = process.env.ROLE!!;
    const configuration: ReactionRoleConfiguration[] = [
        {
            messageId: MESSAGE,
            reaction: "🔴",
            roleId: ROLE,
        },
    ];
    return new ReactionRole(client, configuration);
};
