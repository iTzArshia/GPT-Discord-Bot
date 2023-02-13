const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const config = require('../../config.json');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("translate")
        .setDescription("Translate your texts from any language to any language!")
        .addStringOption(option => option
            .setName("prompt")
            .setDescription("What is your text?")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("language")
            .setDescription("What language would you like me to translate your prompt into?")
            .setChoices(
                { name: 'English', value: 'English' },
                { name: 'Spanish', value: 'Spanish' },
                { name: 'French', value: 'French' },
                { name: 'Chinese', value: 'Chinese' },
                { name: 'Bulgarian', value: 'Bulgarian' },
                { name: 'Czech', value: 'Czech' },
                { name: 'Danish', value: 'Danish' },
                { name: 'German', value: 'German' },
                { name: 'Greek', value: 'Greek' },
                { name: 'Finnish', value: 'Finnish' },
                { name: 'Hungarian', value: 'Hungarian' },
                { name: 'Indonesian', value: 'Indonesian' },
                { name: 'Italian', value: 'Italian' },
                { name: 'Japanese', value: 'Japanese' },
                { name: 'Lithuanian', value: 'Lithuanian' },
                { name: 'Latvian', value: 'Latvian' },
                { name: 'Dutch', value: 'Dutch' },
                { name: 'Polish', value: 'Polish' },
                { name: 'Portuguese', value: 'Portuguese' },
                { name: 'Romanian', value: 'Romanian' },
                { name: 'Russian', value: 'Russian' },
                { name: 'Slovak', value: 'Slovak' },
                { name: 'Swedish', value: 'Swedish' },
                { name: 'Turkish', value: 'Turkish' },
                { name: 'Ukrainian', value: 'Ukrainian' }
            )
            .setRequired(true)
        ),

    async execute(client, interaction) {

        await interaction.deferReply();

        const configuration = new openAI.Configuration({ apiKey: config.OpenAIapiKey });
        const openai = new openAI.OpenAIApi(configuration);

        const question = interaction.options.getString("prompt");
        const language = interaction.options.getString("language") || 'English';

        const prompt = `I want you to act as an ${language} translator, spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in ${language}. I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, upper level ${language} words and sentences. Keep the meaning same, but make them more literary. I want you to only reply the correction, the improvements and nothing else, do not write explanations. My first sentence is “${question}”`;

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