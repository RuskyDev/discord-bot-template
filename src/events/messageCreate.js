const { logger } = require('../helpers/logger');
const settings = require("../../settings");

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        const prefix = settings.PREFIX;

        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.prefixCommands.get(commandName);
        
        if (!command) return;

        const { cooldowns } = client;
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Map());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = Math.ceil((expirationTime - now) / 1000);

                if (message.cooldownMessage) {
                    try {
                        await message.cooldownMessage.edit(`Please wait **${timeLeft}** more second(s) before reusing the **${prefix}${command.name}** command.`);
                    } catch (error) {
                        logger.log('error', error);
                        return;
                    }
                } else {
                    try {
                        const cooldownMessage = await message.reply(`Please wait **${timeLeft}** more second(s) before reusing the **${prefix}${command.name}** command.`);
                        message.cooldownMessage = cooldownMessage;
                    } catch (error) {
                        logger.log('error', error);
                        return;
                    }
                }

                setTimeout(async () => {
                    if (message.cooldownMessage) {
                        try {
                            await message.cooldownMessage.delete();
                        } catch (error) {
                            logger.log('error', error);
                        }
                    }
                }, cooldownAmount - (now - timestamps.get(message.author.id)));
                
                return;
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
            await command.execute(message, args);
        } catch (error) {
            logger.log('error', error);
            message.reply('Uh oh, an error occurred while executing this command. Please try again later.');
        }
    },
};
