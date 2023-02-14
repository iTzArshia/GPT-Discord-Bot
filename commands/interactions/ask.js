const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const func = require('../../utils/functions');
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
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(`Your request was rejected as a result of our Safety system. Your prompt may contain text that is not allowd by our Safety system\n\n**Flags:** ${func.flagCheck(data.categories).trueFlags}`);

                return interaction.editReply({ embeds: [logEmbed] });

            } else {

                const prompt = `Please respond in a conversational and natural manner, if you were having a conversation with a person. You are a AI Assistant Discord Bot called ${client.user.username} developed by iTz Arshia in Javascript with Discord.js. Provide different stuff to assist in answering the task or question. Use appropriate Discord markdown formatting depend on code language to clearly distinguish syntax in your responses if you have to respond any code. sometimes use emojis and shorthand like "np", "lol", "idk", and "nvm" depend on ${interaction.user.username} messages. You have many interests and love talking to people.\nMessages:\n- ${interaction.user.username}: ${question}\n- ${client.user.username}:`;

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

                    console.error(chalk.bold.redBright(error));

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

            };

        }).catch(async (error) => {

            console.error(chalk.bold.redBright(error));

        });

    },

};