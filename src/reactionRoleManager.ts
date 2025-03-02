import { Client, Snowflake } from "discord.js"
import { ClientSingleton } from "./Globals"
import { ReactionRole, ReactionRoleConfiguration } from "discordjs-reaction-role"

export const setupReactionRoleManager = (client: Client) => {
    console.log("Setting up reaction role manager...");
    
    const MESSAGE: Snowflake = process.env.MESSAGE!!;
    const ROLE: Snowflake = process.env.ROLE!!;
    
    console.log(`Using message ID: ${MESSAGE}`);
    console.log(`Using role ID: ${ROLE}`);
    
    const configuration: ReactionRoleConfiguration[] = [
        {
            messageId: MESSAGE,
            reaction: "🍕",
            roleId: ROLE,
        },
    ];
    
    const reactionRoleManager = new ReactionRole(client, configuration);
    console.log("Reaction role manager setup complete");
    
    return reactionRoleManager;
};
