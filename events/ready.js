const Discord = require('discord.js');
const chalk = require('chalk');

module.exports = async (client) => {

    await client.user.setPresence({
        activities: [
            {
                name: `Brains`,
                type: Discord.ActivityType.Watching
            }
        ],
        status: 'online'
    });

    console.log(chalk.bold.greenBright(`${client.user.tag} is online and ready to answer your questions!`));

};