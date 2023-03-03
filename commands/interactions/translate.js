const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const fs = require('node:fs');
const func = require('../../utils/functions');
const settings = require('../../utils/settings');
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

                const logEmbed = new Discord.EmbedBuilder()
                    .setColor(config.ErrorColor)
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(`Your request was rejected as a result of our safety system. Your prompt may contain text that is not allowd by our safety system\n\n**Flags:** ${func.flagCheck(data.categories).trueFlags}`);

                await interaction.editReply({ embeds: [logEmbed] });

            } else {

                const language = interaction.options.getString("language") || 'English';
                const translatorPrompt = fs.readFileSync("./utils/prompts/translator.txt", "utf-8");
                const prompt = translatorPrompt
                    .replaceAll('{botUsername}', client.user.username)
                    .replaceAll('{userUsername}', interaction.user.username)
                    .replaceAll('{language}', language)
                    .replaceAll('{question}', question);

                openai.createCompletion({

                    model: 'text-davinci-003',
                    prompt: prompt,
                    max_tokens: func.tokenizer('davinci', prompt).maxTokens,
                    temperature: settings.translator.temprature,
                    top_p: settings.translator.top_p,
                    frequency_penalty: settings.translator.frequency_penalty,
                    presence_penalty: settings.translator.presence_penalty

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
                                text: `Costs ${func.pricing('davinci', usage.total_tokens)}`,
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

            };

        }).catch(async (error) => {

            console.error(chalk.bold.redBright(error));

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