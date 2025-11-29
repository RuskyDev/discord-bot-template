export default {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const now = Date.now();
        if (!client.cooldowns.has(command.data.name)) client.cooldowns.set(command.data.name, new Map());
        const timestamps = client.cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const data = timestamps.get(interaction.user.id);
            if (now < data.expires) {
                await interaction.reply({ 
                    content: `You are on cooldown! You can use **/${command.data.name}** again <t:${Math.floor(data.expires / 1000)}:R>.`,
                    ephemeral: true
                }).catch(() => {});
                return;
            }
        }

        try {
            await command.execute(interaction);
        } catch {
            await interaction.reply({ content: "Uh oh, an error occurred while executing this command.", ephemeral: true }).catch(() => {});
        }

        const expires = now + cooldownAmount;
        timestamps.set(interaction.user.id, { expires });
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    }
};
