const Discord = require('discord.js');
const openAI = require('openai');
const config = require('../config.json');

module.exports = {
    name: "imagine",
    aliases: ['draw'],
    description: "Draw your imaginations",

    async execute(client, message, args, cmd) {

        await message.channel.sendTyping();

        if (!args[0]) {

            const embed = new Discord.EmbedBuilder()
                .setColor('Red')
                .setTitle('Error')
                .setDescription(`You can't use the \`${cmd}\` command like this you have to provide something like the example\n\`\`\`\n${config.Prefix}${cmd} A Dragon under water\n\`\`\``);

            return await message.reply({ embeds: [embed] });

        };

        try {

            const configuration = new openAI.Configuration({ apiKey: config.openAIapiKey });
            const openai = new openAI.OpenAIApi(configuration);

            const question = args.join(" ");

            const response = await openai.createImage({
                prompt: question,
                n: 4,
                size: '1024×1024'
            });

            const embeds = [

                new Discord.EmbedBuilder()
                    .setColor('Purple')
                    .setURL('https://github.com/iTzArshia/GPT-Discord-Bot')
                    .setDescription(question)
                    .setImage(response.data.data[0].url)

            ];

            for (let i = 0; i < 3; i++) {

                const embed = new Discord.EmbedBuilder()
                    .setURL('https://github.com/iTzArshia/GPT-Discord-Bot')
                    .setImage(response.data.data[i + 1].url);

                embeds.push(embed);

            };

            await message.reply({ embeds: embeds });

        } catch (error) {

            console.error(error);

            if (error.response) {

                const embed = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setTitle(`Error [${error.response.status}]`)
                    .setDescription(error.response.data.error.message);

                await message.reply({ embeds: [embed] });

            };

        };

    },
};