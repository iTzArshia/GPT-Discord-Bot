const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const fs = require('node:fs');
const func = require('../../utils/functions');
const settings = require('../../utils/settings');
const config = require('../../configs/config.json');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("ask")
        .setDescription("Answers your questions!")
        .addStringOption(option => option
            .setName("prompt")
            .setDescription("What is your question?")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("model")
            .setDescription("What model do you want to ask from? (Default: ChatGPT)")
            .setChoices(
                {
                    name: 'ChatGPT (BEST OF THE BEST)',
                    value: 'chatgpt'
                },
                {
                    name: 'Davinci (Most powerful)',
                    value: 'davinci'
                },
                {
                    name: 'Curie',
                    value: 'curie'
                },
                {
                    name: 'Babbage',
                    value: 'babbage'
                },
                {
                    name: 'Ada (Fastest)',
                    value: 'ada'
                },
            )
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

        const moderation = await openai.createModeration({ input: question }).catch(async (error) => {

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

        const moderationData = moderation.data.results[0];
        if (moderationData.flagged) {

            const logEmbed = new Discord.EmbedBuilder()
                .setColor(config.ErrorColor)
                .setAuthor({
                    name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setDescription(`Your request was rejected as a result of our safety system. Your prompt may contain text that is not allowd by our safety system\n\n**Flags:** ${func.flagCheck(moderationData.categories).trueFlags}`);

            await interaction.editReply({ embeds: [logEmbed] });

        } else {

            const model = interaction.options.getString('model') || 'chatgpt';
            const modelNames = {
                'chatgpt': 'gpt-3.5-turbo',
                'davinci': 'text-davinci-003',
                'curie': 'text-curie-001',
                'babbage': 'text-babbage-001',
                'ada': 'text-ada-001'
            };

            const chatGPTprompt = fs.readFileSync(`./utils/prompts/${model === 'chatgpt' ? 'chatCompletion' : 'completion'}.txt`, "utf-8");
            const prompt = chatGPTprompt
                .replaceAll('{botUsername}', client.user.username)
                .replaceAll('{userUsername}', interaction.user.username)
                .replaceAll('{question}', question);

            let completion, answer;

            if (model === 'chatgpt') {

                const messages = [
                    {
                        "role": "system",
                        "content": prompt
                    },
                    {
                        "role": 'user',
                        "content": question
                    }
                ];

                completion = await openai.createChatCompletion({

                    model: modelNames[model],
                    messages: messages,
                    max_tokens: func.tokenizer(model, messages).maxTokens,
                    temperature: settings.completion.temprature,
                    top_p: settings.completion.top_p,
                    frequency_penalty: settings.completion.frequency_penalty,
                    presence_penalty: settings.completion.presence_penalty

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

            } else {

                completion = await openai.createCompletion({

                    model: modelNames[model],
                    prompt: prompt,
                    max_tokens: func.tokenizer(model, prompt).maxTokens,
                    temperature: settings.completion.temprature,
                    top_p: settings.completion.top_p,
                    frequency_penalty: settings.completion.frequency_penalty,
                    presence_penalty: settings.completion.presence_penalty

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

            if (model === 'chatgpt') answer = completion.data.choices[0].message.content;
            else answer = completion.data.choices[0].text;

            const usage = completion.data.usage;

            const moderation2 = await openai.createModeration({ input: answer }).catch(async (error) => {

                console.error(chalk.bold.redBright(error));

                if (error.response) {

                    const embed = new Discord.EmbedBuilder()
                        .setColor(config.ErrorColor)
                        .setAuthor({
                            name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setDescription(error.response.data.error.message)
                        .setFooter({
                            text: `Costs ${func.pricing(model, usage.total_tokens)}`,
                            iconURL: client.user.displayAvatarURL()
                        });

                    await interaction.editReply({ embeds: [embed] }).catch(() => null);

                } else if (error.message) {

                    const embed = new Discord.EmbedBuilder()
                        .setColor(config.ErrorColor)
                        .setAuthor({
                            name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setDescription(error.message)
                        .setFooter({
                            text: `Costs ${func.pricing(model, usage.total_tokens)}`,
                            iconURL: client.user.displayAvatarURL()
                        });

                    await interaction.editReply({ embeds: [embed] }).catch(() => null);

                };

            });

            const moderation2Data = moderation2.data.results[0];
            if (moderation2Data.flagged) {

                const embed = new Discord.EmbedBuilder()
                    .setColor(config.ErrorColor)
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(`Your request was rejected as a result of our safety system. Your prompt may contain text that is not allowd by our safety system\n\n**Flags:** ${func.flagCheck(moderation2Data.categories).trueFlags}`)
                    .setFooter({
                        text: `Costs ${func.pricing(model, usage.total_tokens)}`,
                        iconURL: client.user.displayAvatarURL()
                    });

                return interaction.editReply({ embeds: [embed] });

            } else {

                if (answer.length < 4096) {

                    const embed = new Discord.EmbedBuilder()
                        .setColor(config.MainColor)
                        .setAuthor({
                            name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setDescription(answer)
                        .setFooter({
                            text: `Costs ${func.pricing(model, usage.total_tokens)}`,
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

            };

        };

    },

};