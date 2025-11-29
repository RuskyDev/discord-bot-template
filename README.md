# Discord Bot Template
A modern Discord.js bot template

## Features
* Over 4 customizable options via `config.js`
* Slash Command Handler
* Prefix Command Handler
* Event Handler
* Cooldown Handler

## Installation
1. Clone the repository:

```bash
git clone https://github.com/RuskyDev/discord-bot-template-v15.git
cd discord-bot-template-v15
```

2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and add your credentials:

```
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_BOT_CLIENT_ID=your_discord_bot_client_id
```

4. Configure `config.js` to adjust the bot settings:

```js
export default {
    PREFIX: '!',                  // Prefix for prefix commands
    ACTIVITY_TEXT: 'with Discord',// Bot presence text
    ACTIVITY_TYPE: 'Playing',     // Playing, Watching, Listening, etc.
    ACTIVITY_STATUS: 'Online',    // Online, Idle, DoNotDisturb, Invisible
};
```

5. Start the bot:

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

## Commands

### Prefix Commands
Stored in `./src/commands/prefix` and triggered using the prefix from `config.js`. Commands can have cooldowns in seconds.

Example – `ping` command:

```js
export default {
    name: 'ping',
    description: 'Replies with Pong!',
    cooldown: 5,
    execute(message) {
        message.channel.send('Pong!');
    },
};
```

### Slash Commands
Stored in `./src/commands/slash` and automatically registered globally when the bot starts.

Example – `ping` slash command:

```js
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
```

## Events
Stored in `./src/events` and automatically loaded on bot start.

Example – `messageCreate` event:

```js
export default {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        console.log(`Message received: ${message.content}`);
    },
};
```

## Cooldowns
Commands can have cooldowns defined per command in seconds:

```js
export default {
    name: 'ping',
    cooldown: 5,
    async execute(message) {
        message.channel.send('Pong!');
    },
};
```

## License
This project is licensed under the [MIT License](./LICENSE).