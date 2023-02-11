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

        try {

            const configuration = new openAI.Configuration({ apiKey: config.OpenAIapiKey });
            const openai = new openAI.OpenAIApi(configuration);

            const question = interaction.options.getString("prompt");

            const response = await openai.createImage({
                prompt: question,
                n: 4,
                size: '1024×1024'
            });

            const embeds = [

                new Discord.EmbedBuilder()
                    .setColor(config.MainColor)
                    .setURL('https://github.com/iTzArshia/GPT-Discord-Bot')
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setImage(response.data.data[0].url)

            ];

            for (let i = 0; i < 3; i++) {

                const embed = new Discord.EmbedBuilder()
                    .setURL('https://github.com/iTzArshia/GPT-Discord-Bot')
                    .setImage(response.data.data[i + 1].url);

                embeds.push(embed);

            };

            await interaction.editReply({ embeds: embeds });

        } catch (error) {

            if (error.response) {

                const embed = new Discord.EmbedBuilder()
                    .setColor(config.ErrorColor)
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(error.response.data.error.message);

                await interaction.editReply({ embeds: [embed] }).catch(() => null);

            } else {

                console.error(error);

            };

        };

    },

};