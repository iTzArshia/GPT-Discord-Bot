const Discord = require('discord.js');
const openAI = require('openai');
const config = require('../../config.json');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("imagine")
        .setDescription("Draw your imaginations!")
        .addStringOption(option => option
            .setName("prompt")
            .setDescription("What is your imagine?")
            .setRequired(true)
        ),

    async execute(client, interaction) {

        await interaction.deferReply();

        const configuration = new openAI.Configuration({ apiKey: config.OpenAIapiKey });
        const openai = new openAI.OpenAIApi(configuration);

        const question = interaction.options.getString("prompt");

        openai.createImage({

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
                    .setImage(data.data[0].url)

            ];

            for (let i = 0; i < 3; i++) {

                const embed = new Discord.EmbedBuilder()
                    .setURL('https://github.com/iTzArshia/GPT-Discord-Bot')
                    .setImage(data.data[i + 1].url);

                embeds.push(embed);

            };

            await interaction.editReply({ embeds: embeds });

        }).catch(async (error) => {

            console.error(error);

            if (error.response) {

                const embed = new Discord.EmbedBuilder()
                    .setColor(config.ErrorColor)
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(error.response.data.error.message);

                await interaction.editReply({ embeds: [embed] }).catch(() => null);

            } else if (error.message) {

                const embed = new Discord.EmbedBuilder()
                    .setColor(config.ErrorColor)
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(error.message);

                await interaction.editReply({ embeds: [embed] }).catch(() => null);

            };

        });

    },

};