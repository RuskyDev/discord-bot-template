const { logger } = require('../helpers/logger');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const { cooldowns } = client;
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Map());
        }
        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
            if (now < expirationTime) {
                try {
                    await interaction.reply({ content: `Please wait **${Math.ceil((expirationTime - now) / 1000)}** more second(s) before reusing the **/${command.data.name}** command.`, ephemeral: true });
                } catch (error) {
                    logger.log('error', error);
                }
                return;
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            await command.execute(interaction);
        } catch (error) {
            logger.log('error', error);
            try {
                await interaction.reply({ content: "Uh oh, an error occurred while executing this command. Please try again later.", ephemeral: true });
            } catch (replyError) {
                logger.log('error', error);
            }
        }
    },
};
