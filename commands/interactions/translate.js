const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const func = require('../../utils/functions');
const config = require('../../configs/config.json');

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
            .setDescription("What language would you like me to translate your prompt into? (Default: English)")
            .setRequired(false)
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

        const configuration = new openAI.Configuration({ apiKey: config.OpenAIapiKey });
        const openai = new openAI.OpenAIApi(configuration);

        const question = interaction.options.getString("prompt");

        openai.createModeration({

            input: question

        }).then(async (response) => {

            const data = response.data.results[0];
            if (data.flagged) {

                function replaces(string) {
                    return string
                        .replace('sexual', 'Sexual')
                        .replace('hate', 'Hate')
                        .replace('violence', 'Violence')
                        .replace('self-harm', 'Self-Harm')
                        .replace('sexual/minors', 'Sexual/Minors')
                        .replace('hate/threatening', 'Hate/Threatening')
                        .replace('violence/graphic', 'Violence/Graphic')
                };

                const logEmbed = new Discord.EmbedBuilder()
                    .setColor(config.ErrorColor)
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(`Your request was rejected as a result of our Safety system. Your prompt may contain text that is not allowd by our Safety system\n\n**Flags:** ${func.flagCheck(data.categories).trueFlags}`);

                return interaction.editReply({ embeds: [logEmbed] });

            } else {

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

            };

        }).catch(async (error) => {

            console.error(chalk.bold.redBright(error));

        });

    },

};