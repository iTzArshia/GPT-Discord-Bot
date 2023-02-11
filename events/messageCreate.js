const Discord = require('discord.js');
const config = require('../config.json');

module.exports = async (client, message) => {

    if (message.channel.type === Discord.ChannelType.DM || message.author.bot || message.system || !message.content.toLowerCase().startsWith(config.Prefix)) return;

    const args = message.content.slice(config.Prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = client.MessageCommands.get(cmd) || client.MessageCommands.find(c => c.aliases && c.aliases.includes(cmd));
    if (command) {

        try {
            command.execute(client, message, args, cmd);
        } catch (error) {
            console.error(error);
        };

    };

};