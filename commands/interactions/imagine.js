const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const func = require('../../utils/functions');
const config = require('../../configs/config.json');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("imagine")
        .setDescription("Draw your imaginations!")
        .addStringOption(option => option
            .setName("prompt")
            .setDescription("What is your imagine?")
            .setRequired(true)
        )
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

        const openai = new openAI.OpenAI({ apiKey: config.OpenAIapiKey });

        const question = interaction.options.getString("prompt");

        openai.images.generate({

            prompt: question,
            n: 4,
            size: '1024x1024'

        }).then(async (response) => {

            const data = response.data;

            const embeds = [

                new Discord.EmbedBuilder()
                    .setColor(config.MainColor)
                    .setURL('https://github.com/iTzArshia/GPT-Discord-Bot')
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setImage(data[0].url)
                    .setFooter({
                        text: `Costs ${func.pricing('dall.e', 4, '1024x1024')}`,
                        iconURL: client.user.displayAvatarURL()
                    })

            ];

            const buttons = [

                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setLabel('Image 1')
                    .setURL(data[0].url)

            ];

            for (let i = 0; i < 3; i++) {

                const embed = new Discord.EmbedBuilder()
                    .setURL('https://github.com/iTzArshia/GPT-Discord-Bot')
                    .setImage(data[i + 1].url);

                const button = new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setLabel(`Image ${i + 2}`)
                    .setURL(data[i + 1].url)

                embeds.push(embed);
                buttons.push(button);

            };

            const row = new Discord.ActionRowBuilder()
                .addComponents(buttons);

            await interaction.editReply({
                embeds: embeds,
                components: [row]
            });

        }).catch(async (error) => {

            console.error(chalk.bold.redBright(error));

            if (error.response) {

                const embed = new Discord.EmbedBuilder()
                    .setColor(config.ErrorColor)
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(error.response.error.message.length > 4096 ? error.response.error.message.substring(0, 4093) + "..." : error.response.error.message);

                await interaction.editReply({ embeds: [embed] }).catch(() => null);

            } else if (error.message) {

                const embed = new Discord.EmbedBuilder()
                    .setColor(config.ErrorColor)
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(error.message.length > 4096 ? error.message.substring(0, 4093) + "..." : error.message);

                await interaction.editReply({ embeds: [embed] }).catch(() => null);

            };

        });

    },

};