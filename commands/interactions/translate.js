const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const config = require('../../config.json');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("translate")
        .setDescription("Translate your texts from any language to English!")
        .addStringOption(option => option
            .setName("prompt")
            .setDescription("What is your text?")
            .setRequired(true)
        ),

    async execute(client, interaction) {

        await interaction.deferReply();

        const configuration = new openAI.Configuration({ apiKey: config.OpenAIapiKey });
        const openai = new openAI.OpenAIApi(configuration);

        const question = interaction.options.getString("prompt");
        const prompt = `||>System: Instructions for ${client.user.username}: Please act as an English translator. spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it to English and then answer in the corrected and improved version of my text in English. I want you to replace my simplified words and sentences with more beautiful and elegant, upper level English words and sentences. Retain the meaning, but elevate them into a higher literacy competency. I want you to only reply to the correction, the improvements and nothing else, do not write any additional explanations.\n||>Messages:\n||>${interaction.user.username}: ${question}\n||>${client.user.username}:`;

        openai.createCompletion({

            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 2048,
            temperature: 0.77,
            top_p: 0.9,
            frequency_penalty: 0.95,
            presence_penalty: 0.95

        }).then(async (response) => {

            const answer = response.data.choices[0].text;
            const usage = response.data.usage;

            if (answer.length < 4096) {

                const embed = new Discord.EmbedBuilder()
                    .setColor(config.MainColor)
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(answer)
                    .setFooter({
                        text: `Consumed ${usage.total_tokens} (Q: ${usage.prompt_tokens} | A: ${usage.completion_tokens}) Tokens`,
                        iconURL: client.user.displayAvatarURL()
                    });

                await interaction.editReply({ embeds: [embed] });

            } else {

                const attachment = new Discord.AttachmentBuilder(
                    Buffer.from(`${question}\n\n${answer}`, 'utf-8'),
                    { name: 'response.txt' }
                );
                await interaction.editReply({ files: [attachment] });

            };

        }).catch(async (error) => {

            console.error(chalk.bold.redBright(error));

            if (error.message) {

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