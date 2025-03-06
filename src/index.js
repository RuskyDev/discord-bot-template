const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

client.commands = new Collection();
client.prefixCommands = new Collection();
client.cooldowns = new Collection();

if (settings.ACTIVITY_MOBILE_ONLINE_STATUS && settings.ACTIVITY_STATUS === "Online") {
    const { DefaultWebSocketManagerOptions: { identifyProperties } } = require("@discordjs/ws");
    identifyProperties.browser = "Discord Android";
}

const commandsPath = path.join(__dirname, 'commands');
const eventPath = path.join(__dirname, 'events');

if (fs.existsSync(commandsPath)) {
    const commandFolders = fs.readdirSync(commandsPath);
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, folder, file));
            if (folder === 'slash') {
                client.commands.set(command.data.name, command);
            } else if (folder === 'prefix') {
                client.prefixCommands.set(command.name, command);
            }
        }
    }
}

if (fs.existsSync(eventPath)) {
    const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);
