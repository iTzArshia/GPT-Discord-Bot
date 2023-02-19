const Discord = require('discord.js');
const os = require('node:os');
const func = require('../../utils/functions');
const config = require('../../configs/config.json');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows the bot\'s latency.")
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

        const embed = new Discord.EmbedBuilder()
            .setColor(config.MainColor)
            .setAuthor({
                name: `Pong!`,
                iconURL: client.user.displayAvatarURL({ size: 1024 })
            })
            .addFields(
                {
                    name: `📡 Ping:`,
                    value: `${client.ws.ping}ms`,
                    inline: true
                },
                {
                    name: `💾 Memory:`,
                    value: `${func.numberWithCommas(Math.round((process.memoryUsage().rss / 1024 / 1024)))}/${func.numberWithCommas(Math.round(os.totalmem() / 1024 / 1024))}MB`,
                    inline: true
                },
                {
                    name: `⏳ Uptime:`,
                    value: func.timestamp(client.readyTimestamp),
                    inline: false
                },
            )
            .setFooter({
                text: `Commanded by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ size: 1024 })
            });

        return await interaction.editReply({ embeds: [embed] });

    },

};