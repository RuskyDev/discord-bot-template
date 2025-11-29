import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .setIntegrationTypes(0, 1) // 0: Guild Install, 1: User Install
        .setContexts(0, 1, 2),   // 0: Guild, 1: Bot DM, 2: Group Chat
    cooldown: 5,
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};
