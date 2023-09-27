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
            .setDescription("What model do you want to ask from? (Default: GPT 3.5)")
            .setChoices(
                {
                    name: 'GPT-3.5 (Cheaper)',
                    value: 'gpt-3.5'
                },
                {
                    name: 'GPT-4 (Smarter)',
                    value: 'gpt-4'
                }
            )
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName('stream')
            .setDescription('Streams the bot\'s response. (Default: Disable)')
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
            .setRequired(false)
        ),

    async execute(client, interaction) {

        const ephemeralChoice = interaction.options.getString('ephemeral');
        const ephemeral = ephemeralChoice === 'Enable' ? true : false;

        await interaction.deferReply({ ephemeral: ephemeral });

        const streamChoice = interaction.options.getString('stream');
        const stream = streamChoice === 'Enable' ? true : false;

        const openai = new openAI.OpenAI({ apiKey: config.OpenAIapiKey });

        const question = interaction.options.getString("prompt");

        const model = interaction.options.getString('model') || 'gpt-3.5';
        const modelNames = {
            'gpt-3.5': 'gpt-3.5-turbo',
            'gpt-4': 'gpt-4'
        };

        const completionPrompt = fs.readFileSync(`./utils/prompts/${model === 'chatgpt' || model === 'davinci' ? 'chatCompletion' : 'completion'}.txt`, "utf-8");
        const prompt = completionPrompt
            .replaceAll('{botUsername}', client.user.username)
            .replaceAll('{userUsername}', interaction.user.username)
            .replaceAll('{question}', question);

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

        const completion = await openai.chat.completions.create({

            model: modelNames[model],
            messages: messages,
            max_tokens: func.tokenizer(model, messages).maxTokens,
            temperature: settings.completion.temprature,
            top_p: settings.completion.top_p,
            frequency_penalty: settings.completion.frequency_penalty,
            presence_penalty: settings.completion.presence_penalty,
            stream: stream

        }).catch(async (error) => {

            console.error(chalk.bold.redBright(error));

            if (error.response) {

                const embed = new Discord.EmbedBuilder()
                    .setColor(config.ErrorColor)
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(error.response.error.message);

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

        if (!stream) {

            const answer = completion.choices[0].message.content;
            const usage = completion.usage;

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

        } else {

            let mainString = "";
            let string = "";
            let iterator = 0;

            for await (const part of completion) {

                if (part.choices[0]?.delta?.finish_reason === 'stop') {

                    const fullmessages = [
                        {
                            "role": "system",
                            "content": prompt
                        },
                        {
                            "role": 'user',
                            "content": question
                        },
                        {
                            "role": 'assistant',
                            "content": mainString
                        },
                    ];

                    const totalTokens = func.tokenizer(model, fullmessages).tokens;

                    const embed = new Discord.EmbedBuilder()
                        .setColor(config.MainColor)
                        .setAuthor({
                            name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setDescription(mainString)
                        .setFooter({
                            text: `Costs ${func.pricing(model, totalTokens)}`,
                            iconURL: client.user.displayAvatarURL()
                        });

                    await interaction.editReply({ embeds: [embed] });

                } else {

                    if (string.includes('\n\n')) {

                        const embed = new Discord.EmbedBuilder()
                            .setColor(config.MainColor)
                            .setAuthor({
                                name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                            .setDescription(mainString)
                            .setFooter({
                                text: `Writing...`,
                                iconURL: client.user.displayAvatarURL()
                            });

                        await interaction.editReply({ embeds: [embed] });

                        iterator = 0;
                        string = "";

                        await func.delay(5000);

                    };

                    iterator += 1;
                    string += part.choices[0]?.delta?.content || '';
                    mainString += part.choices[0]?.delta?.content || '';

                };

            };

            // if (iterator > 0) {

            //     const fullmessages = [
            //         {
            //             "role": "system",
            //             "content": prompt
            //         },
            //         {
            //             "role": 'user',
            //             "content": question
            //         },
            //         {
            //             "role": 'assistant',
            //             "content": mainString
            //         },
            //     ];

            //     const totalTokens = func.tokenizer(model, fullmessages).tokens;

            //     const embed = new Discord.EmbedBuilder()
            //         .setColor(config.MainColor)
            //         .setAuthor({
            //             name: question.length > 256 ? question.substring(0, 253) + "..." : question,
            //             iconURL: interaction.user.displayAvatarURL()
            //         })
            //         .setDescription(mainString)
            //         .setFooter({
            //             text: `Costs ${func.pricing(model, totalTokens)}`,
            //             iconURL: client.user.displayAvatarURL()
            //         });

            //     await interaction.editReply({ embeds: [embed] });

            // };

        };

    },

};