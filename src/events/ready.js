const { REST, Routes, ActivityType, PresenceUpdateStatus } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settings = require('../../settings');
const { logger } = require('../helpers/logger');
require('dotenv').config();

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

        logger.log('info', `Logged in as ${client.user.tag}`);

        const commands = [];
        const slashCommandPath = path.join(__dirname, '../commands/slash');
        const prefixCommandPath = path.join(__dirname, '../commands/prefix');

        if (fs.existsSync(slashCommandPath)) {
            const commandFiles = fs.readdirSync(slashCommandPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = require(path.join(slashCommandPath, file));
                commands.push(command.data.toJSON());
                logger.log('info', 'Slash Command Loader', `Loaded /${command.data.name}`);
            }
        }

        if (fs.existsSync(prefixCommandPath)) {
            const prefixCommandFiles = fs.readdirSync(prefixCommandPath).filter(file => file.endsWith('.js'));

            for (const file of prefixCommandFiles) {
                const commandName = file.replace('.js', '');
                logger.log('info', 'Prefix Command Loader', `Loaded ${settings.PREFIX}${commandName}`);
            }
        }

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

        try {
            await rest.put(
                Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID),
                { body: commands },
            );

            logger.log('info', 'Slash Command Loader', 'Successfully registered global application commands.');
        } catch (error) {
            logger.log('error', error);
        }

        client.user.setPresence({
            activities: [{
                name: settings.ACTIVITY_TEXT,
                type: ActivityType[settings.ACTIVITY_TYPE]
            }],
            status: PresenceUpdateStatus[settings.ACTIVITY_STATUS]
        });
    },
};
