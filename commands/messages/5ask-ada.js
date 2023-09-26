const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const fs = require('node:fs');
const func = require('../../utils/functions');
const settings = require('../../utils/settings');
const config = require('../../configs/config.json');

module.exports = {
    name: "Ada",
    aliases: ['Ask-Ada', 'Text-Ada'],
    description: "Answers your questions using __Text-Ada__ model! **(Fastest)**",

    async execute(client, message, args, cmd) {

        await message.channel.sendTyping();

        if (!args[0]) {

            const embed = new Discord.EmbedBuilder()
                .setColor(config.ErrorColor)
                .setTitle('Error')
                .setDescription(`You can't use the \`${cmd}\` command like this you have to provide something like the example\n\`\`\`\n${config.Prefix}${cmd} Explain loops in JavaScript.\n\`\`\``);

            await message.reply({ embeds: [embed] });

        } else {

            const configuration = new openAI.Configuration({ apiKey: config.OpenAIapiKey });
            const openai = new openAI.OpenAIApi(configuration);

            const question = args.join(" ");

            const chatGPTprompt = fs.readFileSync("./utils/prompts/completion.txt", "utf-8");
            const prompt = chatGPTprompt
                .replaceAll('{botUsername}', client.user.username)
                .replaceAll('{userUsername}', message.author.username)
                .replaceAll('{question}', question);

            openai.createCompletion({

                model: 'text-ada-001',
                prompt: prompt,
                max_tokens: func.tokenizer('ada', prompt).maxTokens,
                temperature: settings.completion.temprature,
                top_p: settings.completion.top_p,
                frequency_penalty: settings.completion.frequency_penalty,
                presence_penalty: settings.completion.presence_penalty

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
                            text: `Costs ${func.pricing('ada', usage.total_tokens)}`,
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

    },

};