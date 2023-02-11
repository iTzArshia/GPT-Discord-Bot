const Discord = require('discord.js');

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

    console.log(`${client.user.tag} is online and ready to answer your questions!`);

};