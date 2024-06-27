import { Client, GatewayIntentBits, REST } from "discord.js";
import { env } from "./env";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

export const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
