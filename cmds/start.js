import { readFileSync } from "fs";
import { addUser } from "../utils/database.js";
import { escapeMarkdown } from "../utils/helpers.js";

const config = JSON.parse(readFileSync(new URL("../config.json", import.meta.url)));

export default {
    name: "start",
    version: "1.0.0",
    author: "Azadx69x",
    role: 0,
    category: "general",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;
        const user = message.from;

        addUser(user);

        const text =
`🤖 Welcome!
Hello, *${escapeMarkdown(user.first_name)}*! 👋  

I am @${config.bot.username}
Your smart Telegram assistant.  

📋 Use /help to see all commands`;

        await client.sendMessage(chatId, text, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "📋 Help", callback_data: "help" },
                        { text: "👤 My Info", callback_data: "info" }
                    ]
                ]
            }
        });
    }
};
