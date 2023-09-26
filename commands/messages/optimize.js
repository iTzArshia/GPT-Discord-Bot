const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const fs = require('node:fs');
const func = require('../../utils/functions');
const settings = require('../../utils/settings');
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

            await message.reply({ embeds: [embed] });

        };

        const configuration = new openAI.Configuration({ apiKey: config.OpenAIapiKey });
        const openai = new openAI.OpenAIApi(configuration);

        const question = args.join(" ");

        const optimizerPrompt = fs.readFileSync("./utils/prompts/optimizer.txt", "utf-8");
        const prompt = optimizerPrompt + question + ".";

        const messages = [{
            "role": 'user',
            "content": prompt
        }];

        openai.createChatCompletion({

            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: func.tokenizer('chatgpt', messages).maxTokens,
            temperature: settings.optimzer.temprature,
            top_p: settings.optimzer.top_p,
            frequency_penalty: settings.optimzer.frequency_penalty,
            presence_penalty: settings.optimzer.presence_penalty

        }).then(async (response) => {

            const answer = response.data.choices[0].message.content
                .replace("Optimized Prompt:", "")
                .replace("Optimized prompt:", "")
                .replace("Optimized Output:", "")
                .replace("Optimized output:", "")
                .replace("Output:", "")
                .replace("output:", "");

            const usage = response.data.usage;

            const embed = new Discord.EmbedBuilder()
                .setColor(config.MainColor)
                .setAuthor({
                    name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(answer)
                .setFooter({
                    text: `Costs ${func.pricing('chatgpt', usage.total_tokens)}`,
                    iconURL: client.user.displayAvatarURL()
                });

            await message.reply({ embeds: [embed] });

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