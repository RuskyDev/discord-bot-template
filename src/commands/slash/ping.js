const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .setIntegrationTypes(0, 1) // 0 for Guild Install, 1 for User Install
        .setContexts(0, 1, 2), // 0 for Guild, 1 for Bot DM, 2 for Group Chat        
    cooldown: 5,
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};
