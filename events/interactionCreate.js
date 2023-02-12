const chalk = require('chalk');

module.exports = async (client, interaction) => {

    if (!interaction.isChatInputCommand() || !interaction.channel.permissionsFor(interaction.guild.members.me).has(["ViewChannel", "SendMessages", "EmbedLinks", "ReadMessageHistory"])) return;

    const command = client.SlashCommands.get(interaction.commandName);
    if (command) {

        try {
            command.execute(client, interaction);
        } catch (error) {
            console.error(chalk.bold.redBright(error));
            return await interaction.reply({ content: error.message.length > 4096 ? error.message.slice(0, 4093) + "..." : error.message, ephemeral: true }).catch(() => null);
        };

    };

};