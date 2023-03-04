const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const func = require('../../utils/functions');
const config = require('../../configs/config.json');

module.exports = {
    name: "Imagine",
    aliases: ['I', 'D', 'Draw'],
    description: "Draw your imaginations!",

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

        openai.createImage({

            prompt: question,
            n: 4,
            size: '1024x1024'

        }).then(async (response) => {

            const data = response.data.data;

            const embeds = [

                new Discord.EmbedBuilder()
                    .setColor(config.MainColor)
                    .setURL('https://github.com/iTzArshia/GPT-Discord-Bot')
                    .setAuthor({
                        name: question.length > 256 ? question.substring(0, 253) + "..." : question,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setImage(data[0].url)
                    .setFooter({
                        text: `Costs ${func.pricing('dall.e', 4, '1024x1024')}`,
                        iconURL: client.user.displayAvatarURL()
                    })

            ];

            const buttons = [

                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setLabel('Image 1')
                    .setURL(data[0].url)

            ];

            for (let i = 0; i < 3; i++) {

                const embed = new Discord.EmbedBuilder()
                    .setURL('https://github.com/iTzArshia/GPT-Discord-Bot')
                    .setImage(data[i + 1].url);

                const button = new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setLabel(`Image ${i + 2}`)
                    .setURL(data[i + 1].url)

                embeds.push(embed);
                buttons.push(button);

            };

            const row = new Discord.ActionRowBuilder()
                .addComponents(buttons);

            await message.reply({
                embeds: embeds,
                components: [row]
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

    },

};