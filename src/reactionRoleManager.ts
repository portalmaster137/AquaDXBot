import { Client, Snowflake, TextChannel, Message } from "discord.js"
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
            reaction: config.reaction.toString(),
            roleId: config.roleId as Snowflake,
        };
    });
    
    // Add missing reactions to messages
    await addMissingReactions(client, configuration);
    
    const reactionRoleManager = new ReactionRole(client, configuration);
    console.log(`Reaction role manager setup complete with ${configuration.length} configurations`);
    
    return reactionRoleManager;
};

// Function to add missing reactions to messages
async function addMissingReactions(client: Client, configs: ReactionRoleConfiguration[]) {
    // Group configurations by message ID for efficiency
    const messageConfigs = new Map<Snowflake, { reaction: string, roleId: Snowflake }[]>();
    
    configs.forEach(config => {
        if (!messageConfigs.has(config.messageId)) {
            messageConfigs.set(config.messageId, []);
        }
        messageConfigs.get(config.messageId)?.push({
            reaction: config.reaction.toString(),
            roleId: config.roleId
        });
    });
    
    // Process each message
    for (const [messageId, configsForMessage] of messageConfigs.entries()) {
        try {
            // Find the message across all accessible channels
            let targetMessage: Message | null = null;
            
            for (const guild of client.guilds.cache.values()) {
                if (targetMessage) break;
                
                const channels = guild.channels.cache.filter(
                    channel => channel.isTextBased() && !channel.isThread()
                );
                
                for (const channel of channels.values()) {
                    try {
                        const textChannel = channel as TextChannel;
                        const message = await textChannel.messages.fetch(messageId).catch(() => null);
                        if (message) {
                            targetMessage = message;
                            console.log(`Found message ${messageId} in channel #${textChannel.name} (${textChannel.id})`);
                            break;
                        }
                    } catch (error) {
                        // Skip channels where we don't have permission
                    }
                }
            }
            
            if (!targetMessage) {
                console.log(`Could not find message ${messageId} in any channel`);
                continue;
            }
            
            // Check and add missing reactions
            const existingReactions = targetMessage.reactions.cache.map(r => 
                r.emoji.id ? `<:${r.emoji.name}:${r.emoji.id}>` : r.emoji.name
            );
            
            for (const config of configsForMessage) {
                const reactionExists = existingReactions.some(existing => 
                    existing === config.reaction || 
                    existing === config.reaction.replace(/^<a:/, '<:')  // Handle animated vs. static emojis
                );
                
                if (!reactionExists) {
                    console.log(`Adding missing reaction ${config.reaction} to message ${messageId}`);
                    try {
                        // Handle custom emoji format <:name:id> or <a:name:id>
                        if (config.reaction.startsWith('<') && config.reaction.endsWith('>')) {
                            const match = config.reaction.match(/<a?:([^:]+):(\d+)>/);
                            if (match) {
                                const emojiId = match[2];
                                await targetMessage.react(emojiId);
                            }
                        } else {
                            await targetMessage.react(config.reaction);
                        }
                        console.log(`Successfully added reaction ${config.reaction} to message ${messageId}`);
                    } catch (error) {
                        console.error(`Failed to add reaction ${config.reaction} to message ${messageId}:`, error);
                    }
                    
                    // Add a small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (error) {
            console.error(`Error processing message ${messageId}:`, error);
        }
    }
}

// Helper function to add a new reaction role configuration
export const addReactionRole = async (messageId: Snowflake, roleId: Snowflake, reaction: string, client?: Client) => {
    await db.collection("reactionRoles").insertOne({
        messageId,
        roleId,
        reaction
    });
    console.log(`Added new reaction role: message=${messageId}, role=${roleId}, reaction=${reaction}`);
    
    // If client is provided, add the reaction to the message immediately
    if (client) {
        try {
            // Find the message across all accessible channels
            let targetMessage: Message | null = null;
            
            for (const guild of client.guilds.cache.values()) {
                if (targetMessage) break;
                
                const channels = guild.channels.cache.filter(
                    channel => channel.isTextBased() && !channel.isThread()
                );
                
                for (const channel of channels.values()) {
                    try {
                        const textChannel = channel as TextChannel;
                        const message = await textChannel.messages.fetch(messageId).catch(() => null);
                        if (message) {
                            targetMessage = message;
                            break;
                        }
                    } catch (error) {
                        // Skip channels where we don't have permission
                    }
                }
            }
            
            if (!targetMessage) {
                console.log(`Could not find message ${messageId} in any channel`);
                return;
            }
            
            // Add the reaction to the message
            if (reaction.startsWith('<') && reaction.endsWith('>')) {
                const match = reaction.match(/<a?:([^:]+):(\d+)>/);
                if (match) {
                    const emojiId = match[2];
                    await targetMessage.react(emojiId);
                }
            } else {
                await targetMessage.react(reaction);
            }
            console.log(`Added reaction ${reaction} to message ${messageId}`);
        } catch (error) {
            console.error(`Failed to add reaction ${reaction} to message ${messageId}:`, error);
        }
    }
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
