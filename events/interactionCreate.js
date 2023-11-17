const Discord = require('discord.js');
const chalk = require('chalk');
const ms = require('ms');
const { moderation } = require('../configs/moderation');

module.exports = async (client, interaction) => {

    try {

        // Command Handler
        if (interaction.isChatInputCommand()) {

            const command = client.SlashCommands.get(interaction.commandName);
            if (command) {

                try {
                    command.execute(client, interaction);
                } catch (error) {
                    console.error(chalk.bold.redBright(error));
                    return await interaction.reply({ content: error.message.length > 4096 ? error.message.slice(0, 4093) + "..." : error.message, ephemeral: true }).catch(() => null);
                };

            };

            // Auto Moderation
        } else if (interaction.isButton()) {

            const id = interaction.customId.split('-');

            if (['deleteMessage', 'timeout', 'kick', 'ban'].includes(id[0])) {

                await interaction.deferReply({ ephemeral: true });

                let admin = false;
                if (
                    interaction.member.roles.cache.hasAny(...moderation.AdminRoles)
                    || moderation.AdminUsers.includes(interaction.member.id)
                ) admin = true;


                if (id[0] === 'deleteMessage') {

                    const channel = client.channels.cache.get(id[1]);
                    if (admin || channel?.permissionsFor(interaction.member).has('ManageMessages')) {

                        if (channel.permissionsFor(interaction.guild.members.me).has('ManageMessages')) {

                            const message = await channel.messages.fetch({ message: id[2] }).catch(() => null);
                            if (message) {

                                try {

                                    await message.delete();

                                    if (interaction.message.components.length === 1) {

                                        const embed = Discord.EmbedBuilder.from(interaction.message.embeds[0]);

                                        embed.addFields({
                                            name: 'Message Action:',
                                            value: `Message deleted by ${interaction.user} \`(${interaction.user.id})\``
                                        });

                                        const row1 = Discord.ActionRowBuilder.from(interaction.message.components[0]);

                                        const buttons = [];
                                        for (const button of interaction.message.components[1].components) {
                                            const newButton = Discord.ButtonBuilder.from(button).setDisabled();
                                            buttons.push(newButton);
                                        };

                                        const row2 = new Discord.ActionRowBuilder()
                                            .addComponents(buttons);

                                        await interaction.message.edit({
                                            embeds: [embed],
                                            components: [row1, row2]
                                        });

                                    } else if (interaction.message.components.length > 1) {

                                        const embed = Discord.EmbedBuilder.from(interaction.message.embeds[0]);

                                        embed.addFields({
                                            name: 'Message Action:',
                                            value: `Message deleted by ${interaction.user} \`(${interaction.user.id})\``
                                        });

                                        const row1 = Discord.ActionRowBuilder.from(interaction.message.components[0]);

                                        const buttons = [];
                                        for (const button of interaction.message.components[1].components) {
                                            const newButton = Discord.ButtonBuilder.from(button).setDisabled();
                                            buttons.push(newButton);
                                        };

                                        const row2 = new Discord.ActionRowBuilder()
                                            .addComponents(buttons);

                                        await interaction.message.edit({
                                            embeds: [embed],
                                            components: [row1, row2]
                                        });

                                    };

                                    await interaction.editReply({ content: 'The message has been deleted successfully.' });

                                } catch (error) {
                                    await interaction.editReply({ content: `There was an error while deleting this message, *(${error.message})*` });
                                };

                            } else {

                                const row1 = Discord.ActionRowBuilder.from(interaction.message.components[0]);

                                const buttons = [];
                                for (const button of interaction.message.components[1].components) {
                                    const newButton = Discord.ButtonBuilder.from(button).setDisabled();
                                    buttons.push(newButton);
                                };

                                const row2 = new Discord.ActionRowBuilder()
                                    .addComponents(buttons);

                                await interaction.message.edit({ components: [row1, row2] });

                                await interaction.editReply({ content: 'This message has already been deleted.' });

                            };

                        } else await interaction.editReply({ content: `I need Manage Message permission in ${channel}.` });

                    } else await interaction.editReply({ content: 'You can\'t use this button. you are not an Admin.' });

                } else if (id[0] === 'timeout') {

                    if (admin || interaction.member.permissions.has('ModerateMembers')) {

                        const member = await interaction.guild.members.fetch(id[1]).catch(() => null);
                        if (member) {

                            try {

                                if (member.moderatable) {

                                    if (
                                        interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0
                                        && interaction.user.id !== interaction.guild.ownerId
                                    ) return await interaction.editReply({ content: `You can't timeout ${member.user.tag}` });

                                    const timeoutButton1 = new Discord.ButtonBuilder()
                                        .setLabel(`60 Seconds`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('60s');
                                    const timeoutButton2 = new Discord.ButtonBuilder()
                                        .setLabel(`5 Mins`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('5m');
                                    const timeoutButton3 = new Discord.ButtonBuilder()
                                        .setLabel(`10 Mins`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('10m');
                                    const timeoutButton4 = new Discord.ButtonBuilder()
                                        .setLabel(`1 Hour`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('1h');
                                    const timeoutButton5 = new Discord.ButtonBuilder()
                                        .setLabel(`1 Day`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('1d');
                                    const timeoutButton6 = new Discord.ButtonBuilder()
                                        .setLabel(`3 Days`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('3d');
                                    const timeoutButton7 = new Discord.ButtonBuilder()
                                        .setLabel(`1 Week`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('1w');

                                    const cancelButton = new Discord.ButtonBuilder()
                                        .setLabel(`Cancel`)
                                        .setStyle(Discord.ButtonStyle.Secondary)
                                        .setCustomId('Cancel');

                                    const row1 = new Discord.ActionRowBuilder()
                                        .addComponents([
                                            timeoutButton1,
                                            timeoutButton2,
                                            timeoutButton3,
                                            timeoutButton4,
                                        ]);

                                    const row2 = new Discord.ActionRowBuilder()
                                        .addComponents([
                                            timeoutButton5,
                                            timeoutButton6,
                                            timeoutButton7,
                                            cancelButton,
                                        ]);

                                    const reply = await interaction.editReply({
                                        content: `Are you sure you want timeout ${member} (${member.user.tag}) if yes select one of the Timeout Durations buttons (Red ones)`,
                                        components: [
                                            row1,
                                            row2
                                        ]
                                    });

                                    const collector = await reply.createMessageComponentCollector({ time: 60000 });

                                    collector.on('collect', async (int) => {

                                        if (int.customId === 'Cancel') {

                                            await collector.stop("messageDelete");
                                            await int.deferUpdate();
                                            await interaction.deleteReply();

                                        } else {

                                            await collector.stop("timed out");
                                            await int.deferUpdate();

                                            const duration = ms(int.customId);
                                            await member.timeout(duration, `Timed out by ${interaction.user.tag}`);

                                            const embed = Discord.EmbedBuilder.from(interaction.message.embeds[0]);

                                            embed.addFields({
                                                name: 'Punish Action:',
                                                value: `${member.user.tag} timed out by ${interaction.user} \`(${interaction.user.id})\` for ${ms(duration, { long: true })}.`
                                            });

                                            await interaction.message.edit({ embeds: [embed] }).catch(() => null);

                                            await interaction.editReply({
                                                content: `${member.user.tag} has been timed out successfully.`,
                                                components: []
                                            });

                                        };

                                    });

                                    collector.on('end', async (collection, reason) => {

                                        if (["messageDelete", "timed out"].includes(reason)) return;

                                        await interaction.editReply({
                                            components: [
                                                new Discord.ActionRowBuilder().addComponents([
                                                    timeoutButton1.setDisabled(true),
                                                    timeoutButton2.setDisabled(true),
                                                    timeoutButton3.setDisabled(true),
                                                    timeoutButton4.setDisabled(true)
                                                ]),
                                                new Discord.ActionRowBuilder().addComponents([
                                                    timeoutButton5.setDisabled(true),
                                                    timeoutButton6.setDisabled(true),
                                                    timeoutButton7.setDisabled(true),
                                                    cancelButton.setDisabled(true)
                                                ]),
                                            ]
                                        });

                                    });

                                } else await interaction.editReply({ content: `I can't timeout ${member.user.tag}.` });

                            } catch (error) {
                                await interaction.editReply({ content: `There was an error while timeouting ${member}, *(${error.message})*` });
                            };

                        } else {

                            const user = await client.users.fetch(id[1]).catch(() => null);
                            if (user) await interaction.editReply({ content: `${user.tag} is no longer in the server.` });
                            else await interaction.editReply({ content: 'This user is no longer in the server.' });

                        };

                    } else await interaction.editReply({ content: 'You can\'t use this button. you are not an Admin.' });

                } else if (id[0] === 'kick') {

                    if (admin || interaction.member.permissions.has('KickMembers')) {

                        const member = await interaction.guild.members.fetch(id[1]).catch(() => null);
                        if (member) {

                            try {

                                if (member.kickable) {

                                    if (
                                        interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0
                                        && interaction.user.id !== interaction.guild.ownerId
                                    ) return await interaction.editReply({ content: `You can't kick ${member.user.tag}` });

                                    const kickButton = new Discord.ButtonBuilder()
                                        .setLabel(`Kick ${member.user.username}`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('Kick');

                                    const cancelButton = new Discord.ButtonBuilder()
                                        .setLabel(`Cancel`)
                                        .setStyle(Discord.ButtonStyle.Secondary)
                                        .setCustomId('Cancel');

                                    const row = new Discord.ActionRowBuilder()
                                        .addComponents([kickButton, cancelButton]);

                                    const reply = await interaction.editReply({
                                        content: `Are you sure you want kick ${member} (${member.user.tag})`,
                                        components: [row]
                                    });

                                    const collector = await reply.createMessageComponentCollector({ time: 60000 });

                                    collector.on('collect', async (int) => {

                                        if (int.customId === 'Kick') {

                                            await collector.stop("kicked");
                                            await int.deferUpdate();

                                            await member.kick(`Kicked by ${interaction.user.tag}`);

                                            const embed = Discord.EmbedBuilder.from(interaction.message.embeds[0]);

                                            embed.addFields({
                                                name: 'Punish Action:',
                                                value: `${member.user.tag} kicked by ${interaction.user} \`(${interaction.user.id})\``
                                            });

                                            await interaction.message.edit({ embeds: [embed] }).catch(() => null);

                                            await interaction.editReply({
                                                content: `${member.user.tag} has been kicked successfully.`,
                                                components: []
                                            });

                                        } else if (int.customId === 'Cancel') {

                                            await collector.stop("messageDelete");
                                            await int.deferUpdate();
                                            await interaction.deleteReply();

                                        };

                                    });

                                    collector.on('end', async (collection, reason) => {

                                        if (["messageDelete", "kicked"].includes(reason)) return;

                                        await interaction.editReply({
                                            components: [new Discord.ActionRowBuilder().addComponents([
                                                kickButton.setDisabled(true),
                                                cancelButton.setDisabled(true)
                                            ])]
                                        });

                                    });

                                } else await interaction.editReply({ content: `I can't kick ${member.user.tag}.` });

                            } catch (error) {
                                await interaction.editReply({ content: `There was an error while kicking ${member}, *(${error.message})*` });
                            };

                        } else {

                            const user = await client.users.fetch(id[1]).catch(() => null);
                            if (user) await interaction.editReply({ content: `${user.tag} is no longer in the server.` });
                            else await interaction.editReply({ content: 'This user is no longer in the server.' });

                        };

                    } else await interaction.editReply({ content: 'You can\'t use this button. you are not an Admin.' });

                } else if (id[0] === 'ban') {

                    if (admin || interaction.member.permissions.has('BanMembers')) {

                        const member = await interaction.guild.members.fetch(id[1]).catch(() => null);
                        if (member) {

                            try {

                                if (member.bannable) {

                                    if (
                                        interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0
                                        && interaction.user.id !== interaction.guild.ownerId
                                    ) return await interaction.editReply({ content: `You can't ban ${member.user.tag}` });

                                    const banButton1 = new Discord.ButtonBuilder()
                                        .setLabel(`Don't Delete Any`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('0');
                                    const banButton2 = new Discord.ButtonBuilder()
                                        .setLabel(`Previous Hour`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('1h');
                                    const banButton3 = new Discord.ButtonBuilder()
                                        .setLabel(`Previous 6 Hours`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('6h');
                                    const banButton4 = new Discord.ButtonBuilder()
                                        .setLabel(`Previous 12 Hours`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('12h');
                                    const banButton5 = new Discord.ButtonBuilder()
                                        .setLabel(`Previous 24 Hours`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('24h');
                                    const banButton6 = new Discord.ButtonBuilder()
                                        .setLabel(`Previous 3 Days`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('3d');
                                    const banButton7 = new Discord.ButtonBuilder()
                                        .setLabel(`Previous 7 Days`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('7d');

                                    const cancelButton = new Discord.ButtonBuilder()
                                        .setLabel(`Cancel`)
                                        .setStyle(Discord.ButtonStyle.Secondary)
                                        .setCustomId('Cancel');

                                    const row1 = new Discord.ActionRowBuilder()
                                        .addComponents([
                                            banButton1,
                                            banButton2,
                                            banButton3,
                                            banButton4,
                                        ]);

                                    const row2 = new Discord.ActionRowBuilder()
                                        .addComponents([
                                            banButton5,
                                            banButton6,
                                            banButton7,
                                            cancelButton,
                                        ]);

                                    const reply = await interaction.editReply({
                                        content: `Are you sure you want ban ${member} (${member.user.tag}) if yes select one of the Delete Message History buttons (Red ones)`,
                                        components: [
                                            row1,
                                            row2
                                        ]
                                    });

                                    const collector = await reply.createMessageComponentCollector({ time: 60000 });

                                    collector.on('collect', async (int) => {

                                        if (int.customId === 'Cancel') {

                                            await collector.stop("messageDelete");
                                            await int.deferUpdate();
                                            await interaction.deleteReply();

                                        } else {

                                            await collector.stop("banned");
                                            await int.deferUpdate();

                                            const duration = ms(int.customId);
                                            await member.ban({ deleteMessageSeconds: duration / 1000, reason: `Banned by ${interaction.user.tag}` });

                                            const embed = Discord.EmbedBuilder.from(interaction.message.embeds[0]);

                                            let fieldValue = `${member.user.tag} banned by ${interaction.user} \`(${interaction.user.id})\` and all their messages in the last ${ms(duration, { long: true })} were deleted.`;
                                            if (duration === 0) fieldValue = `${member.user.tag} banned by ${interaction.user} \`(${interaction.user.id})\``;

                                            embed.addFields({
                                                name: 'Punish Action:',
                                                value: fieldValue
                                            });

                                            await interaction.message.edit({ embeds: [embed] }).catch(() => null);

                                            await interaction.editReply({
                                                content: `${member.user.tag} has been banned successfully.`,
                                                components: []
                                            });

                                        };

                                    });

                                    collector.on('end', async (collection, reason) => {

                                        if (["messageDelete", "banned"].includes(reason)) return;

                                        await interaction.editReply({
                                            components: [
                                                new Discord.ActionRowBuilder().addComponents([
                                                    banButton1.setDisabled(true),
                                                    banButton2.setDisabled(true),
                                                    banButton3.setDisabled(true),
                                                    banButton4.setDisabled(true)
                                                ]),
                                                new Discord.ActionRowBuilder().addComponents([
                                                    banButton5.setDisabled(true),
                                                    banButton6.setDisabled(true),
                                                    banButton7.setDisabled(true),
                                                    cancelButton.setDisabled(true)
                                                ]),
                                            ]
                                        });

                                    });

                                } else await interaction.editReply({ content: `I can't ban ${member.user.tag}.` });

                            } catch (error) {
                                await interaction.editReply({ content: `There was an error while banning ${member}, *(${error.message})*` });
                            };

                        } else {

                            const user = await client.users.fetch(id[1]).catch(() => null);

                            try {

                                const fetchedBan = await interaction.guild.bans.fetch(user.id).catch(() => null);
                                if (!fetchedBan) {

                                    const banButton1 = new Discord.ButtonBuilder()
                                        .setLabel(`Don't Delete Any`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('0');
                                    const banButton2 = new Discord.ButtonBuilder()
                                        .setLabel(`Previous Hour`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('1h');
                                    const banButton3 = new Discord.ButtonBuilder()
                                        .setLabel(`Previous 6 Hours`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('6h');
                                    const banButton4 = new Discord.ButtonBuilder()
                                        .setLabel(`Previous 12 Hours`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('12h');
                                    const banButton5 = new Discord.ButtonBuilder()
                                        .setLabel(`Previous 24 Hours`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('24h');
                                    const banButton6 = new Discord.ButtonBuilder()
                                        .setLabel(`Previous 3 Days`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('3d');
                                    const banButton7 = new Discord.ButtonBuilder()
                                        .setLabel(`Previous 7 Days`)
                                        .setStyle(Discord.ButtonStyle.Danger)
                                        .setCustomId('7d');

                                    const cancelButton = new Discord.ButtonBuilder()
                                        .setLabel(`Cancel`)
                                        .setStyle(Discord.ButtonStyle.Secondary)
                                        .setCustomId('Cancel');

                                    const row1 = new Discord.ActionRowBuilder()
                                        .addComponents([
                                            banButton1,
                                            banButton2,
                                            banButton3,
                                            banButton4,
                                        ]);

                                    const row2 = new Discord.ActionRowBuilder()
                                        .addComponents([
                                            banButton5,
                                            banButton6,
                                            banButton7,
                                            cancelButton,
                                        ]);

                                    const reply = await interaction.editReply({
                                        content: `Are you sure you want ban ${user} (${user.tag}) if yes select one of the Delete Message History buttons (Red ones)`,
                                        components: [
                                            row1,
                                            row2
                                        ]
                                    });

                                    const collector = await reply.createMessageComponentCollector({ time: 60000 });

                                    collector.on('collect', async (int) => {

                                        if (int.customId === 'Cancel') {

                                            await collector.stop("messageDelete");
                                            await int.deferUpdate();
                                            await interaction.deleteReply();

                                        } else {

                                            await collector.stop("banned");
                                            await int.deferUpdate();

                                            const duration = ms(int.customId);
                                            await interaction.guild.bans.create(id[1], { deleteMessageSeconds: duration / 1000, reason: `Banned by ${interaction.user.tag}` });

                                            const embed = Discord.EmbedBuilder.from(interaction.message.embeds[0]);

                                            let fieldValue = `${user ? user.tag : id[1]} banned by ${interaction.user} \`(${interaction.user.id})\` and all their messages in the last ${ms(duration, { long: true })} were deleted.`;
                                            if (duration === 0) fieldValue = `${user ? user.tag : id[1]} banned by ${interaction.user} \`(${interaction.user.id})\``;

                                            embed.addFields({
                                                name: 'Punish Action:',
                                                value: fieldValue
                                            });

                                            await interaction.message.edit({ embeds: [embed] }).catch(() => null);

                                            await interaction.editReply({
                                                content: `${user ? user.tag : id[1]} has been banned successfully.`,
                                                components: []
                                            });

                                        };

                                    });

                                    collector.on('end', async (collection, reason) => {

                                        if (["messageDelete", "banned"].includes(reason)) return;

                                        await interaction.editReply({
                                            components: [
                                                new Discord.ActionRowBuilder().addComponents([
                                                    banButton1.setDisabled(true),
                                                    banButton2.setDisabled(true),
                                                    banButton3.setDisabled(true),
                                                    banButton4.setDisabled(true)
                                                ]),
                                                new Discord.ActionRowBuilder().addComponents([
                                                    banButton5.setDisabled(true),
                                                    banButton6.setDisabled(true),
                                                    banButton7.setDisabled(true),
                                                    cancelButton.setDisabled(true)
                                                ]),
                                            ]
                                        });

                                    });

                                } else await interaction.editReply({ content: `${fetchedBan.user.tag} has been already banned.` });

                            } catch (error) {
                                await interaction.editReply({ content: `There was an error while banning this user, *(${error.message})*` });
                            };

                        };

                    } else await interaction.editReply({ content: 'You can\'t use this button. you are not an Admin.' });

                };

            };

        };

    } catch (error) {
        console.error(chalk.bold.redBright(error));
    };

};