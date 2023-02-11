const Discord = require('discord.js');
const fs = require('node:fs');
const config = require('./config.json');

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent
  ]
});
/////////////////////// Anti Crash ///////////////////////

process.on('unhandledRejection', (reason, p) => {
  console.log('[antiCrash] :: Unhandled Rejection/Catch');
  console.log(reason?.stack, p);
});

process.on("uncaughtException", (err, origin) => {
  console.log('[antiCrash] :: Uncaught Exception/Catch');
  console.log(err?.stack, origin);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
  console.log('[antiCrash] :: Uncaught Exception/Catch (MONITOR)');
  console.log(err?.stack, origin);
});

///////////////////////// Login /////////////////////////

client.login(config.botToken);