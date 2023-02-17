const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const func = require('../../utils/functions');
const tokenizer = require('../../utils/encoder/encoder');
const config = require('../../configs/config.json');

module.exports = {
    name: "Translate",
    aliases: ['T'],
    description: "Translate your texts from any language to English!",

    async execute(client, message, args, cmd) {

        await message.channel.sendTyping();

        if (!args[0]) {

            const embed = new Discord.EmbedBuilder()
                .setColor(config.ErrorColor)
                .setTitle('Error')
                .setDescription(`You can't use the \`${cmd}\` command like this you have to provide something like the example\n\`\`\`\n${config.Prefix}${cmd} Salut bonne matinée
                .\n\`\`\``);

            await message.reply({ embeds: [embed] });

        } else {

            const configuration = new openAI.Configuration({ apiKey: config.OpenAIapiKey });
            const openai = new openAI.OpenAIApi(configuration);

            const question = args.join(" ");

            openai.createModeration({

                input: question

            }).then(async (response) => {

                const data = response.data.results[0];
                if (data.flagged) {

                    const logEmbed = new Discord.EmbedBuilder()
                        .setColor(config.ErrorColor)
                        .setAuthor({
                            name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                            iconURL: message.author.displayAvatarURL()
                        })
                        .setDescription(`Your request was rejected as a result of our safety system. Your prompt may contain text that is not allowd by our safety system\n\n**Flags:** ${func.flagCheck(data.categories).trueFlags}`);

                    await message.reply({ embeds: [logEmbed] });

                } else {

                    const prompt = `System: Instructions for ${client.user.username}: Please act as an English translator. spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it to English and then answer in the corrected and improved version of my text in English. I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, upper level English words and sentences. Retain the meaning, but elevate them into a higher literacy competency. I want you to only reply to the correction, the improvements and nothing else, do not write any additional explanations.\nMessages:\n- ${message.author.username}: ${question}\n- ${client.user.username}:`
                    const encoded = tokenizer.encode(prompt);
                    const maxTokens = 4096 - encoded.length;

                    openai.createCompletion({

                        model: 'text-davinci-003',
                        prompt: prompt,
                        max_tokens: maxTokens,
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
                                    iconURL: message.author.displayAvatarURL()
                                })
                                .setDescription(answer)
                                .setFooter({
                                    text: `Consumed ${usage.total_tokens} (Q: ${usage.prompt_tokens} | A: ${usage.completion_tokens}) Tokens`,
                                    iconURL: client.user.displayAvatarURL()
                                });

                            await message.reply({ embeds: [embed] });

                        } else {

                            const attachment = new Discord.AttachmentBuilder(
                                Buffer.from(`${question}\n\n${answer}`, 'utf-8'),
                                { name: 'response.txt' }
                            );
                            await message.reply({ files: [attachment] });

                        };

                    }).catch(async (error) => {

                        console.error(chalk.bold.redBright(error));

                        if (error.message) {

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

                if (error.message) {

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

    },

};