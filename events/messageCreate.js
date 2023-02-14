const Discord = require('discord.js');
const openAI = require('openai');
const chalk = require('chalk');
const config = require('../config.json');
const ms = require('ms');
const func = require('../utils/functions');
const config = require('../configs/config.json');
const { moderation } = require('../configs/moderation');

module.exports = async (client, message) => {

    if (message.channel.type === Discord.ChannelType.DM || message.author.bot || message.system || !message.content.toLowerCase().startsWith(config.Prefix) || !message.channel.permissionsFor(message.guild.members.me).has(["ViewChannel", "SendMessages", "EmbedLinks", "ReadMessageHistory"])) return;
    if (message.channel.type === Discord.ChannelType.DM || message.author.bot || message.system) return;

    const args = message.content.slice(config.Prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = client.MessageCommands.get(cmd) || client.MessageCommands.find(c => c.aliases && c.aliases.map(a => a.toLowerCase()).includes(cmd));
    if (command) {
        // Auto Moderation
        if (moderation.State && !moderation.IgnoredChannels.includes(message.channelId)) {

            const logChannel = client.channels.cache.get(moderation.LogChannel);

            if (logChannel?.permissionsFor(message.guild.members.me).has("ViewChannel", "SendMessages", "EmbedLinks")) {

                const configuration = new openAI.Configuration({ apiKey: config.OpenAIapiKey });
                const openai = new openAI.OpenAIApi(configuration);

                openai.createModeration({

                    input: message.content

                }).then(async (response) => {

                    const data = response.data.results[0];
                    if (data.flagged) {

                        const flags = func.flagCheck(data.categories);

                        const trueFlags = Object.keys(flags.flags).filter(key => flags.flags[key]);

                        const sameFlagsWithAutoDelete = trueFlags.filter(key => moderation.AutoDelete[key]);
                        let messageDeleted = false;

                        if (sameFlagsWithAutoDelete.length) {

                            if (message.channel?.permissionsFor(message.guild.members.me).has("ManageMessages")) {
                                await message.delete().catch(() => null);
                                messageDeleted = true;
                            };
                        };

                        const sameFlagsWithAutoPunish = trueFlags.filter(key => moderation.AutoPunish[key]);

                        let memberPunishResult = {
                            Action: null,
                            Duration: null,
                            Punished: false
                        };

                        if (sameFlagsWithAutoPunish.length) {

                            let punishType = 'Timeout';
                            const punishTypes = sameFlagsWithAutoPunish.map(key => moderation.AutoPunishType[key]);
                            if (punishTypes.includes('Ban')) punishType = 'Ban';
                            else if (punishTypes.includes('Kick')) punishType = 'Kick';

                            if (punishType === 'Timeout' || punishType === 'Ban') {

                                const punishDurations = sameFlagsWithAutoPunish.filter(key => moderation.AutoPunishType[key] === punishType).map(key => moderation.AutoPunishDuration[key]);
                                let duration;
                                if (punishDurations.length > 1) {
                                    const mappedDurations = punishDurations.map(d => ms(d));
                                    duration = Math.max(...mappedDurations);
                                } else {
                                    duration = ms(punishDurations[0]);
                                };

                                if (punishType === 'Timeout') {

                                    if (message.member.moderatable) {

                                        try {
                                            await message.member.timeout(duration, 'Auto Mod');
                                            memberPunishResult = {
                                                Action: punishType,
                                                Duration: duration,
                                                Punished: true
                                            };
                                        } catch (error) {
                                            console.error(chalk.bold.redBright(error));
                                        };

                                    };

                                } else if (punishType === 'Ban') {

                                    if (message.member.bannable) {

                                        try {
                                            await message.member.ban({ deleteMessageSeconds: duration / 1000, reason: 'Auto Mod' });
                                            memberPunishResult = {
                                                Action: punishType,
                                                Duration: duration,
                                                Punished: true
                                            };
                                        } catch (error) {
                                            console.error(chalk.bold.redBright(error));
                                        };

                                    };

                                };

                            } else if (punishType === 'Kick') {

                                if (message.member.kickable) {

                                    try {
                                        await message.member.kick('Auto Mod');
                                        memberPunishResult = {
                                            Action: punishType,
                                            Duration: null,
                                            Punished: true
                                        };
                                    } catch (error) {
                                        console.error(chalk.bold.redBright(error));
                                    };

                                };

                            };

                        };

                        const logEmbed = new Discord.EmbedBuilder()
                            .setColor(moderation.LogColor)
                            .setAuthor({
                                name: message.author.tag,
                                iconURL: message.author.displayAvatarURL()
                            })
                            // .setDescription(message.content)
                            .setDescription(`||${message.content}||`)
                            .setFields(
                                {
                                    name: 'User:',
                                    value: func.userInfo(message.author)
                                },
                                {
                                    name: 'Channel:',
                                    value: func.channelInfo(message.channel)
                                },
                                {
                                    name: 'Flags:',
                                    value: flags.allFlags
                                }
                            );

                        if (messageDeleted) {
                            logEmbed.addFields({
                                name: 'Message Action:',
                                value: `Message deleted automatically.`
                            });
                        };

                        let buttons = [];
                        if (memberPunishResult.Punished) {

                            let fieldValue;
                            if (memberPunishResult.Action === 'Timeout') fieldValue = `${message.author.tag} timed out automatically for ${ms(memberPunishResult.Duration, { long: true })}`;
                            else if (memberPunishResult.Action === 'Ban') fieldValue = `${message.author.tag} banned automatically and all their messages in the last ${ms(memberPunishResult.Duration, { long: true })} were deleted.`;
                            else if (memberPunishResult.Action === 'Kick') fieldValue = `${message.author.tag} kicked automatically `;

                            logEmbed.addFields({
                                name: 'Punish Action:',
                                value: fieldValue
                            });

                            if (!messageDeleted) buttons = ['Message'];

                        } else {

                            if (messageDeleted) buttons = ['Punish'];
                            else buttons = ['Punish', 'Message'];

                        };

                        const rows = [];

                        if (buttons.includes('Punish')) {

                            const timeoutButton = new Discord.ButtonBuilder()
                                .setLabel('Timeout')
                                .setStyle(Discord.ButtonStyle.Danger)
                                .setCustomId(`timeout-${message.author.id}`);

                            const kickButton = new Discord.ButtonBuilder()
                                .setLabel('Kick')
                                .setStyle(Discord.ButtonStyle.Danger)
                                .setCustomId(`kick-${message.author.id}`);

                            const banButton = new Discord.ButtonBuilder()
                                .setLabel('Ban')
                                .setStyle(Discord.ButtonStyle.Danger)
                                .setCustomId(`ban-${message.author.id}`);

                            const punishRow = new Discord.ActionRowBuilder()
                                .addComponents([
                                    timeoutButton,
                                    kickButton,
                                    banButton
                                ]);

                            rows.push(punishRow);

                        };

                        if (buttons.includes('Message')) {

                            const jumpButton = new Discord.ButtonBuilder()
                                .setLabel(`Jump to Flagged Message`)
                                .setStyle(Discord.ButtonStyle.Link)
                                .setURL(message.url);

                            const deleteMessageButton = new Discord.ButtonBuilder()
                                .setLabel(`Delete Flagged Message`)
                                .setStyle(Discord.ButtonStyle.Danger)
                                .setCustomId(`deleteMessage-${message.channelId}-${message.id}`);

                            const messageRow = new Discord.ActionRowBuilder()
                                .addComponents([
                                    jumpButton,
                                    deleteMessageButton
                                ]);

                            rows.push(messageRow);

                        };

                        await logChannel.send({
                            embeds: [logEmbed],
                            components: rows
                        });

                    };

                }).catch(async (error) => {

                    console.error(chalk.bold.redBright(error));

                });

            };

        };

        // Command Handler
        if (message.content.toLowerCase().startsWith(config.Prefix)) {

            const neededPermissions = [
                "ViewChannel",
                "SendMessages",
                "EmbedLinks",
                "ReadMessageHistory"
            ];

            if (!message.channel.permissionsFor(message.guild.members.me).has(neededPermissions)) return;

            const args = message.content.slice(config.Prefix.length).split(/ +/);
            const cmd = args.shift().toLowerCase();
            const command = client.MessageCommands.get(cmd) || client.MessageCommands.find(c => c.aliases && c.aliases.map(a => a.toLowerCase()).includes(cmd));

            if (command) {

                try {
                    command.execute(client, message, args, cmd);
                } catch (error) {
                    console.error(chalk.bold.redBright(error));
                };

                try {
                    command.execute(client, message, args, cmd);
                } catch (error) {
                    console.error(chalk.bold.redBright(error));
                };

            };

        };

    };
    
};