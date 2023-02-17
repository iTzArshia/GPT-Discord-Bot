const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const fs = require('node:fs');
const func = require('../../utils/functions');
const tokenizer = require('../../utils/encoder/encoder');
const config = require('../../configs/config.json');

module.exports = {
    name: "Optimize",
    aliases: ['O', 'OPT', 'Fix'],
    description: "Optimizes your imaginations to get better response with draw!",

    async execute(client, message, args, cmd) {

        await message.channel.sendTyping();

        if (!args[0]) {

            const embed = new Discord.EmbedBuilder()
                .setColor(config.ErrorColor)
                .setTitle('Error')
                .setDescription(`You can't use the \`${cmd}\` command like this you have to provide something like the example\n\`\`\`\n${config.Prefix}${cmd} A Dragon under water\n\`\`\``);

            return await message.reply({ embeds: [embed] });

        };

        const configuration = new openAI.Configuration({ apiKey: config.OpenAIapiKey });
        const openai = new openAI.OpenAIApi(configuration);

        const question = args.join(" ");

        openai.createModeration({

            input: question

        }).then(async (response) => {

            const data = response.data.results[0];
            if (data.flagged) {

                const embed = new Discord.EmbedBuilder()
                    .setColor(config.ErrorColor)
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription(`Your request was rejected as a result of our safety system. Your prompt may contain text that is not allowd by our safety system\n\n**Flags:** ${func.flagCheck(data.categories).trueFlags}`);

                return message.reply({ embeds: [embed] });

            } else {

                const imageOptimizerText = fs.readFileSync("./utils/prompts/optimizer.txt", "utf-8");
                const prompt = imageOptimizerText + question;
                const encoded = tokenizer.encode(prompt);
                const maxTokens = 4096 - encoded.length;

                openai.createCompletion({

                    model: 'text-davinci-003',
                    prompt: prompt,
                    max_tokens: maxTokens,
                    temperature: 1,
                    top_p: 1,
                    frequency_penalty: 0.0,
                    presence_penalty: 0.0

                }).then(async (response) => {

                    const answer = response.data.choices[0].text;
                    const usage = response.data.usage;

                    openai.createModeration({

                        input: answer

                    }).then(async (response) => {

                        const data = response.data.results[0];
                        if (data.flagged) {

                            const embed = new Discord.EmbedBuilder()
                                .setColor(config.ErrorColor)
                                .setAuthor({
                                    name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                                    iconURL: message.author.displayAvatarURL()
                                })
                                .setDescription(`Your request was rejected as a result of our safety system. Your prompt may contain text that is not allowd by our safety system\n\n**Flags:** ${func.flagCheck(data.categories).trueFlags}`)
                                .setFooter({
                                    text: `Costs ${func.pricing('davinci', usage.total_tokens)}`,
                                    iconURL: client.user.displayAvatarURL()
                                });

                            return message.reply({ embeds: [embed] });

                        } else {

                            const embed = new Discord.EmbedBuilder()
                                .setColor(config.MainColor)
                                .setAuthor({
                                    name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                                    iconURL: message.author.displayAvatarURL()
                                })
                                .setDescription(answer)
                                .setFooter({
                                    text: `Costs ${func.pricing('davinci', usage.total_tokens)}`,
                                    iconURL: client.user.displayAvatarURL()
                                });

                            await message.reply({ embeds: [embed] });

                        };

                    }).catch(async (error) => {

                        console.error(chalk.bold.redBright(error));
                        
                        if (error.response) {

                            const embed = new Discord.EmbedBuilder()
                                .setColor(config.ErrorColor)
                                .setAuthor({
                                    name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                                    iconURL: message.author.displayAvatarURL()
                                })
                                .setDescription(error.response.data.error.message)
                                .setFooter({
                                    text: `Costs ${func.pricing('davinci', usage.total_tokens)}`,
                                    iconURL: client.user.displayAvatarURL()
                                });

                            await message.reply({ embeds: [embed] }).catch(() => null);

                        } else if (error.message) {

                            const embed = new Discord.EmbedBuilder()
                                .setColor(config.ErrorColor)
                                .setAuthor({
                                    name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                                    iconURL: message.author.displayAvatarURL()
                                })
                                .setDescription(error.message)
                                .setFooter({
                                    text: `Costs ${func.pricing('davinci', usage.total_tokens)}`,
                                    iconURL: client.user.displayAvatarURL()
                                });

                            await message.reply({ embeds: [embed] }).catch(() => null);

                        };

                    });

                }).catch(async (error) => {

                    console.error(chalk.bold.redBright(error));

                    if (error.response) {

                        const embed = new Discord.EmbedBuilder()
                            .setColor(config.ErrorColor)
                            .setAuthor({
                                name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                                iconURL: message.author.displayAvatarURL()
                            })
                            .setDescription(error.response.data.error.message);

                        await message.reply({ embeds: [embed] }).catch(() => null);

                    } else if (error.message) {

                        const embed = new Discord.EmbedBuilder()
                            .setColor(config.ErrorColor)
                            .setAuthor({
                                name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                                iconURL: message.author.displayAvatarURL()
                            })
                            .setDescription(error.message);

                        await message.reply({ embeds: [embed] }).catch(() => null);

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
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription(error.response.data.error.message);

                await message.reply({ embeds: [embed] }).catch(() => null);

            } else if (error.message) {

                const embed = new Discord.EmbedBuilder()
                    .setColor(config.ErrorColor)
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription(error.message);

                await message.reply({ embeds: [embed] }).catch(() => null);

            };

        });

    },

};