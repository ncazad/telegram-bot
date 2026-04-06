import { readFileSync } from "fs";

export default {
    name: "prefix",
    version: "1.0.0",
    author: "Azadx69x",
    role: 0,
    category: "utility",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;
        const user   = message.from;

        const config = JSON.parse(readFileSync(new URL("../config.json", import.meta.url)));
        const name   = user.first_name || "there";
        const prefix = config.bot?.prefix || "/";

        const text =
`┍━━━[ 📌 PREFIX INFO ]━━━◊
┋👤 Hello ${name}!
┋⚡ Bot Prefix : \`${prefix}\`
┕━━━━━━━━━━━━━━━━◊`;

        await client.sendMessage(chatId, text, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📋 See Commands", callback_data: "help" }]
                ]
            }
        });
    }
};
