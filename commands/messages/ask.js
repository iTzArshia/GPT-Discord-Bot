const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const config = require('../../config.json');
const func = require('../../utils/functions');
const config = require('../../configs/config.json');

module.exports = {
    name: "Ask",
    aliases: ['A', 'GPT', 'Chat'],
    description: "Answers your questions!",

    async execute(client, message, args, cmd) {

        await message.channel.sendTyping();

        if (!args[0]) {

            const embed = new Discord.EmbedBuilder()
                .setColor(config.ErrorColor)
                .setTitle('Error')
                .setDescription(`You can't use the \`${cmd}\` command like this you have to provide something like the example\n\`\`\`\n${config.Prefix}${cmd} Explain loops in JavaScript.\n\`\`\``);

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
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription(`Your request was rejected as a result of our Safety system. Your prompt may contain text that is not allowd by our Safety system\n\n**Flags:** ${func.flagCheck(data.categories).trueFlags}`);

                return message.reply({ embeds: [logEmbed] });

            } else {

                const prompt = `Please respond in a conversational and natural manner, if you were having a conversation with a person. You are a AI Assistant Discord Bot called ${client.user.username} developed by iTz Arshia in Javascript with Discord.js. Provide different stuff to assist in answering the task or question. Use appropriate Discord markdown formatting depend on code language to clearly distinguish syntax in your responses if you have to respond any code. sometimes use emojis and shorthand like "np", "lol", "idk", and "nvm" depend on ${message.author.username} messages. You have many interests and love talking to people.\nMessages:\n- ${message.author.username}: ${question}\n- ${client.user.username}:`;

                openai.createCompletion({

                    model: 'text-davinci-003',
                    prompt: prompt,
                    max_tokens: 2048,
                    temperature: 0.7,
                    top_p: 1

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

        });

    },

};