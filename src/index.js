import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "fs/promises";
import path from "path";
import "dotenv/config.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();
client.prefixCommands = new Collection();
client.cooldowns = new Collection();

const loadCommands = async (commandsDir) => {
    try {
        const folders = await fs.readdir(commandsDir);
        await Promise.all(
            folders.map(async (folder) => {
                const folderPath = path.join(commandsDir, folder);
                const files = (await fs.readdir(folderPath)).filter(f => f.endsWith(".js"));
                await Promise.all(
                    files.map(async (file) => {
                        const { default: command } = await import(path.join(folderPath, file));
                        if (folder === "slash") client.commands.set(command.data.name, command);
                        if (folder === "prefix") client.prefixCommands.set(command.name, command);
                    })
                );
            })
        );
    } catch (err) {
        console.error("Failed to load commands:", err);
    }
};

const loadEvents = async (eventsDir) => {
    try {
        const files = (await fs.readdir(eventsDir)).filter(f => f.endsWith(".js"));
        await Promise.all(
            files.map(async (file) => {
                const { default: event } = await import(path.join(eventsDir, file));
                const handler = (...args) => event.execute(...args, client);
                event.once ? client.once(event.name, handler) : client.on(event.name, handler);
            })
        );
    } catch (err) {
        console.error("Failed to load events:", err);
    }
};

(async () => {
    const token = process.env.DISCORD_BOT_TOKEN;

    if (!token || token.trim() === "") {
        console.error(
            "Discord bot token is missing. Please set DISCORD_BOT_TOKEN in your .env file."
        );
        process.exit(1);
    }

    try {
        const srcPath = path.join(process.cwd(), "src");
        await loadCommands(path.join(srcPath, "commands"));
        await loadEvents(path.join(srcPath, "events"));
        await client.login(token);
    } catch (err) {
        if (err.message.includes("Used disallowed intents")) {
            console.error(
                "Bot failed to login: You are using intents your bot is not allowed to use.\n" +
                "Make sure your bot has the required intents enabled in the Discord Developer Portal " +
                "and that you are using the correct GatewayIntentBits."
            );
        } else {
            console.error("An error occurred while starting the bot:", err);
        }
        process.exit(1);
    }
})();
