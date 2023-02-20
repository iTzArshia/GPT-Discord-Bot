const Discord = require('discord.js');
const config = require('../../configs/config.json');
const { chatbot } = require('../../configs/chatbot');

module.exports = {
  data: new Discord.SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows the Bot's commands list and information.")
    .addStringOption(option => option
      .setName('ephemeral')
      .setDescription('Hides the bot\'s reply from others. (Default: Disable)')
      .addChoices(
        {
          name: 'Enable',
          value: 'Enable'
        },
        {
          name: 'Disable',
          value: 'Disable'
        }
      )
    ),

  async execute(client, interaction) {

    const ephemeralChoice = interaction.options.getString('ephemeral');
    const ephemeral = ephemeralChoice === 'Enable' ? true : false;
    await interaction.deferReply({ ephemeral: ephemeral });

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

    return await interaction.editReply({ embeds: [helpEmbed] });

  },

};