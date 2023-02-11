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

/////////////////////// Events ///////////////////////

const events = fs.readdirSync(`./events/`).filter(file => file.endsWith('.js'));
for (const file of events) {
  const event = require(`./events/${file}`);
  client.on(file.split('.')[0], event.bind(null, client));
  delete require.cache[require.resolve(`./events/${file}`)];
};

///////////////////////// Message Commands /////////////////////////

client.MessageCommands = new Discord.Collection();
const messageCommands = fs.readdirSync(`./commands/messages/`).filter(files => files.endsWith('.js'));
for (const file of messageCommands) {
  const command = require(`./commands/messages/${file}`);
  client.MessageCommands.set(command.name.toLowerCase(), command);
  delete require.cache[require.resolve(`./commands/messages/${file}`)];
};

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