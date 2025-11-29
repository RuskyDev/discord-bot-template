import { REST, Routes, ActivityType, PresenceUpdateStatus } from 'discord.js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config.js';
import config from '../../config.js';

export default {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);

        const commands = [];
        const slashPath = path.join(new URL('.', import.meta.url).pathname, '../commands/slash');
        const prefixPath = path.join(new URL('.', import.meta.url).pathname, '../commands/prefix');

        if (fs.existsSync(slashPath)) {
            for (const file of fs.readdirSync(slashPath).filter(f => f.endsWith('.js'))) {
                const { default: cmd } = await import(path.join(slashPath, file));
                commands.push(cmd.data.toJSON());
                console.log(`Loaded /${cmd.data.name}`);
            }
        }

        if (fs.existsSync(prefixPath)) {
            for (const file of fs.readdirSync(prefixPath).filter(f => f.endsWith('.js'))) {
                console.log(`Loaded ${config.PREFIX}${file.replace('.js','')}`);
            }
        }

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
        try {
            await rest.put(Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID), { body: commands });
            console.log('Successfully registered global application commands.');
        } catch (e) {
            console.error(e);
        }

        client.user.setPresence({
            activities: [{ name: config.ACTIVITY_TEXT, type: ActivityType[config.ACTIVITY_TYPE] }],
            status: PresenceUpdateStatus[config.ACTIVITY_STATUS]
        });
    },
};
