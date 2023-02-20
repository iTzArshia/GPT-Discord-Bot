const Discord = require('discord.js');
const config = require('../../configs/config.json');
const { chatbot } = require('../../configs/chatbot');

module.exports = {
  name: "Help",
  aliases: ["H", "CMD", "CMDs", "Command", "Commands"],
  description: "Shows This!",

  async execute(client, message, args, cmd) {

    await message.channel.sendTyping();

    const helpEmbed = new Discord.EmbedBuilder()
      .setColor(config.MainColor)
      .setAuthor({
        name: `${client.user.username} Commands`,
        iconURL: client.user.displayAvatarURL({ size: 1024 })
      })
      .setDescription(client.MessageCommands.map(c => `> \`${config.Prefix}${c.name}\` \`(${c.aliases?.map(a => `${config.Prefix}${a}`)?.join(' / ') || 'No Aliases'})\`\n> *${c.description}*`).join('\n\n'))
      .setFooter({ text: 'Developed by iTz Arshia#7650 https://github.com/iTzArshia/GPT-Discord-Bot' });

    if (chatbot.State) helpEmbed.addFields({
      name: 'ChatBot:',
      value: `Channel: <#${chatbot.ChatBotChannel}>`,
      inline: true
    });

    return await message.reply({ embeds: [helpEmbed] });

  },

};