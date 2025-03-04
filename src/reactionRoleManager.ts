import { Client, Snowflake, TextChannel, Message, GuildMember } from "discord.js"
import { ReactionRole, ReactionRoleConfiguration } from "discordjs-reaction-role"
import { db } from "./database"

export const setupReactionRoleManager = async (client: Client) => {
    console.log("Setting up reaction role manager...");
    
    const reactionRoleConfigs = await (await db.collection("reactionRoles").find({})).toArray();
    
    if (reactionRoleConfigs.length === 0) {
        console.log("No reaction role configurations found in database");
        return null;
    }
    
    const configuration: ReactionRoleConfiguration[] = reactionRoleConfigs.map((config: { messageId: string; roleId: string; reaction: any; }) => {
        console.log(`Loading reaction role config: message=${config.messageId}, role=${config.roleId}, reaction=${config.reaction}`);
        return {
            messageId: config.messageId as Snowflake,
            reaction: config.reaction.toString(),
            roleId: config.roleId as Snowflake,
        };
    });
    
    await addMissingReactions(client, configuration);
    
    const reactionRoleManager = new ReactionRole(client, configuration);
    
    attachReactionRoleEventListeners(client, reactionRoleManager);
    
    console.log(`Reaction role manager setup complete with ${configuration.length} configurations`);
    
    return reactionRoleManager;
};

function attachReactionRoleEventListeners(client: Client, reactionRoleManager: ReactionRole) {
    client.on('messageReactionAdd', async (reaction, user) => {
        try {
            if (user.bot) return;
            
            const { message } = reaction;
            if (!message.guild) return;
            
            const config = await db.collection("reactionRoles").findOne({
                messageId: message.id,
                reaction: reaction.emoji.id 
                    ? `<${reaction.emoji.animated ? 'a' : ''}:${reaction.emoji.name}:${reaction.emoji.id}>` 
                    : reaction.emoji.name
            });
            
            if (!config) return;
            
            const member = await message.guild.members.fetch(user.id).catch(() => null);
            if (!member) return;
            
        } catch (error) {
            console.error('Error in reaction add event handler:', error);
        }
    });
    
    client.on('messageReactionRemove', async (reaction, user) => {
        try {
            if (user.bot) return;
            
            const { message } = reaction;
            if (!message.guild) return;
            
            const config = await db.collection("reactionRoles").findOne({
                messageId: message.id,
                reaction: reaction.emoji.id 
                    ? `<${reaction.emoji.animated ? 'a' : ''}:${reaction.emoji.name}:${reaction.emoji.id}>` 
                    : reaction.emoji.name
            });
            
            if (!config) return;
            
            const member = await message.guild.members.fetch(user.id).catch(() => null);
            if (!member) return;
            
        } catch (error) {
            console.error('Error in reaction remove event handler:', error);
        }
    });
    
    console.log('Reaction role event listeners attached');
}

// Add missing reactions to messages
async function addMissingReactions(client: Client, configs: ReactionRoleConfiguration[]) {
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
    
    for (const [messageId, configsForMessage] of messageConfigs.entries()) {
        try {
            let targetMessage: Message | null = null;
            
            for (const guild of client.guilds.cache.values()) {
                if (targetMessage) break;
                
                async function findMessage(client: Client, messageId: Snowflake): Promise<Message | null> {
                    for (const guild of client.guilds.cache.values()) {
                        const channels = guild.channels.cache.filter(
                            channel => channel.isTextBased() && !channel.isThread()
                        );
                        for (const channel of channels.values()) {
                            try {
                                const textChannel = channel as TextChannel;
                                const message = await textChannel.messages.fetch(messageId).catch(() => null);
                                if (message) {
                                    console.log(`Found message ${messageId} in channel #${textChannel.name} (${textChannel.id})`);
                                    return message;
                                }
                            } catch (error) {
                                
                            }
                        }
                    }
                    console.log(`Could not find message ${messageId} in any channel`);
                    return null;
                }

                targetMessage = await findMessage(client, messageId);
                if (!targetMessage) continue;
                
                for (const channel of guild.channels.cache.values()) {
                    try {
                        const textChannel = channel as TextChannel;
                        const message = await textChannel.messages.fetch(messageId).catch(() => null);
                        if (message) {
                            targetMessage = message;
                            console.log(`Found message ${messageId} in channel #${textChannel.name} (${textChannel.id})`);
                            break;
                        }
                    } catch (error) {
                        
                    }
                }
            }
            
            if (!targetMessage) {
                console.log(`Could not find message ${messageId} in any channel`);
                continue;
            }
            
            const existingReactions = targetMessage.reactions.cache.map(r => 
                r.emoji.id ? `<:${r.emoji.name}:${r.emoji.id}>` : r.emoji.name
            );
            
            for (const config of configsForMessage) {
                const reactionExists = existingReactions.some(existing => 
                    existing === config.reaction || 
                    existing === config.reaction.replace(/^<a:/, '<:')
                );
                
                if (!reactionExists) {
                    console.log(`Adding missing reaction ${config.reaction} to message ${messageId}`);
                    try {
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
                    
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (error) {
            console.error(`Error processing message ${messageId}:`, error);
        }
    }
}

export const addReactionRole = async (messageId: Snowflake, roleId: Snowflake, reaction: string, client?: Client) => {
    await db.collection("reactionRoles").insertOne({
        messageId,
        roleId,
        reaction
    });
    console.log(`Added new reaction role: message=${messageId}, role=${roleId}, reaction=${reaction}`);
    
    if (client) {
        try {
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
                        
                    }
                }
            }
            
            if (!targetMessage) {
                console.log(`Could not find message ${messageId} in any channel`);
                return;
            }
            
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

