import config from '../../config.js';

export default {
    name: 'messageCreate',
    async execute(message, client) {
        if (!message.content.startsWith(config.PREFIX) || message.author.bot) return;

        const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.prefixCommands.get(commandName);
        if (!command) return;

        if (!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Map());
        const timestamps = client.cooldowns.get(command.name);
        const cooldownMs = (command.cooldown || 3) * 1000;

        const now = Date.now();
        if (timestamps.has(message.author.id)) {
            const data = timestamps.get(message.author.id);
            if (now < data.expires) {
                if (!data.message || data.message.deleted) {
                    data.message = await message.reply(
                        `You are on cooldown! You can use **${config.PREFIX}${command.name}** again <t:${Math.floor(data.expires / 1000)}:R>.`
                    ).catch(() => {});
                    timestamps.set(message.author.id, data);
                }
                return;
            }
        }

        await executeCommand(command, message, args);

        setCooldown(timestamps, message.author.id, cooldownMs);
    }
};

async function executeCommand(command, message, args) {
    try {
        await command.execute(message, args);
    } catch {
        message.reply('Uh oh, an error occurred while executing this command.').catch(() => {});
    }
}

function setCooldown(timestamps, userId, duration) {
    const expires = Date.now() + duration;
    timestamps.set(userId, { expires });

    setTimeout(() => {
        const data = timestamps.get(userId);
        if (data?.message) data.message.delete().catch(() => {});
        timestamps.delete(userId);
    }, duration);
}
