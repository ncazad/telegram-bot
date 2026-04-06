import TelegramBot from "node-telegram-bot-api"
import { readFileSync } from "fs"
import { loadCommands } from "./handlers/commandLoader.js"
import { registerCommands } from "./handlers/commands.js"
import { registerAdminCommands } from "./handlers/admin.js"
import { safeSend } from "./utils/safeSend.js"
import welcomeModule from "./cmds/welcome.js" 

const config = JSON.parse(readFileSync(new URL("./config.json", import.meta.url)))
const token = process.env.BOT_TOKEN || config?.bot?.token

if (!token || token === "YOUR_BOT_TOKEN_HERE") {
    throw new Error("BOT_TOKEN not set")
}

let bot

export async function createBot(usePolling = true) {
    bot = new TelegramBot(token, { polling: usePolling })

    bot.safeSend = (chatId, message, options = {}) => safeSend(bot, chatId, message, options)

    await loadCommands()
    registerCommands(bot)
    registerAdminCommands(bot)

    bot.on("message", async (msg) => {
        if (msg.new_chat_members && msg.new_chat_members.length > 0) {
            await welcomeModule.onChat(bot, msg);
        }
    });

    return bot
}

export function getBot() {
    return bot
}

export { config, token }
