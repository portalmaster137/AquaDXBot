import { EmbedBuilder } from "discord.js";

const testEmbed = new EmbedBuilder()
    .setTitle("Test")
    .setDescription("This is a test embed")
    .setColor(0xFF0000) // RED color in hexadecimal
    .setTimestamp()
    .setFooter({ text: "Test footer" });

const pingEmbed = new EmbedBuilder()
    .setTitle("Pong!")
    .setDescription("This is a ping response embed")
    .setColor(0x00FF00) // GREEN color in hexadecimal
    .setTimestamp()
    .setFooter({ text: "Ping footer" });

export default {
    testEmbed: testEmbed.toJSON(),
    pingEmbed: pingEmbed.toJSON(),
};