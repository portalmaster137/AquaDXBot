import { Client, Snowflake } from "discord.js"
import { ReactionRole, ReactionRoleConfiguration } from "discordjs-reaction-role"
import { db } from "./database" // Assuming you have a database module

export const setupReactionRoleManager = async (client: Client) => {
    console.log("Setting up reaction role manager...");
    
    // Fetch reaction role configurations from database
    const reactionRoleConfigs = await (await db.collection("reactionRoles").find({})).toArray();
    
    if (reactionRoleConfigs.length === 0) {
        console.log("No reaction role configurations found in database");
        return null;
    }
    
    // Convert database entries to ReactionRoleConfiguration format
    const configuration: ReactionRoleConfiguration[] = reactionRoleConfigs.map((config: { messageId: string; roleId: string; reaction: any; }) => {
        console.log(`Loading reaction role config: message=${config.messageId}, role=${config.roleId}, reaction=${config.reaction}`);
        return {
            messageId: config.messageId as Snowflake,
            reaction: config.reaction,
            roleId: config.roleId as Snowflake,
        };
    });
    
    const reactionRoleManager = new ReactionRole(client, configuration);
    console.log(`Reaction role manager setup complete with ${configuration.length} configurations`);
    
    return reactionRoleManager;
};

// Helper function to add a new reaction role configuration
export const addReactionRole = async (messageId: Snowflake, roleId: Snowflake, reaction: string) => {
    await db.collection("reactionRoles").insertOne({
        messageId,
        roleId,
        reaction
    });
    console.log(`Added new reaction role: message=${messageId}, role=${roleId}, reaction=${reaction}`);
};

// Helper function to remove a reaction role configuration
export const removeReactionRole = async (messageId: Snowflake, roleId: Snowflake) => {
    const result = await db.collection("reactionRoles").deleteOne({
        messageId,
        roleId
    });
    
    if (result.deletedCount > 0) {
        console.log(`Removed reaction role: message=${messageId}, role=${roleId}`);
        return true;
    }
    
    console.log(`No reaction role found for message=${messageId}, role=${roleId}`);
    return false;
};
