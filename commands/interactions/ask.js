const Discord = require('discord.js');
const openAI = require('openai');
const config = require('../../config.json');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("ask")
        .setDescription("Answers your questions!")
        .addStringOption(option => option
            .setName("prompt")
            .setDescription("What is your question?")
            .setRequired(true)
        ),

    async execute(client, interaction) {

        await interaction.deferReply();

        const configuration = new openAI.Configuration({ apiKey: config.OpenAIapiKey });
        const openai = new openAI.OpenAIApi(configuration);

        const question = interaction.options.getString("prompt");
        const prompt = `||>System: Instructions for ${client.user.username}: Please respond in a conversational and natural manner, as if you were having a conversation with a person. You are an advanced Discord Bot called ${client.user.username} developed by iTz Arshia in Javascript with Discord.js. Provide different stuff to assist in answering the task or question. Use appropriate discord markdown formatting to clearly distinguish syntax in your response.\n||>Messages:\n||>${interaction.user.username}: ${question}\n||>${client.user.username}:`;

        openai.createCompletion({

            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 1024,
            temperature: 1,
            top_p: 0.9

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
                        text: `Consumed ${usage.total_tokens} (Q: ${usage.prompt_tokens} | A: ${usage.completion_tokens}) Tokens`,
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

            console.error(error);

            if (error.message) {

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