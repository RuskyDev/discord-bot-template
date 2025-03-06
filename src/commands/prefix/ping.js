module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    cooldown: 5,
    execute(message, args) {
        message.channel.send('Pong!');
    },
};
