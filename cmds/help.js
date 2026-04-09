import { getAllCommands } from "../handlers/commandLoader.js";
import fetch from "node-fetch";
import config from "../config.json" with { type: "json" };

const CATEGORY_URL = "https://raw.githubusercontent.com/Azadwebapi/Azadx69x-bm-store/main/category.json";

async function loadCategoryEmojis() {
    try {
        const res = await fetch(CATEGORY_URL);
        return await res.json();
    } catch {
        return {};
    }
}

export default {
    name: "help",
    alias: ["cmds", "commands"],
    version: "1.0.0",
    author: "Azadx69x",
    category: "general",
    description: "Shows all commands.",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;
        const allCmds = getAllCommands();
        const CAT_EMOJI = await loadCategoryEmojis();
        const prefix = config.prefix || ")";

        if (args[0]) {
            const query = args[0].toLowerCase();
            const cmd = allCmds.find(c => c.name === query || c.alias?.includes(query));

            if (!cmd) {
                return client.sendMessage(chatId, `❌ Command not found: ${query}`, { parse_mode: "Markdown" });
            }

            const emoji = CAT_EMOJI[cmd.category] || "📌";

            const info = `
╭━━〔${emoji} COMMAND INFO〕━━╮
┃ ✦ Name     : ${cmd.name}
┃ ✦ Aliases  : ${cmd.alias?.length ? cmd.alias.join(", ") : "None"}
┃ ✦ Category : ${cmd.category || "general"}
┃ ✦ Version  : ${cmd.version || "1.0.0"}
┃ ✦ Author   : ${cmd.author || "Unknown"}
╰━━━━━━━━━━━━━━━━━━━━━╯
`;
            return client.sendMessage(chatId, info, { parse_mode: "Markdown" });
        }

        const categories = {};
        for (const cmd of allCmds) {
            const cat = cmd.category || "general";
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd);
        }

        let text = `╭━━━〔 📖 HELP MENU 〕━━━╮\n`;

        for (const [cat, cmds] of Object.entries(categories)) {
            const emoji = CAT_EMOJI[cat] || "📌";

            text += `┃\n`;
            text += `┃ ${emoji} ${cat.toUpperCase()}\n`;
            text += `┃ ─────────────────\n`;

            cmds.forEach(cmd => {
                text += `┃ ➤ ${cmd.name}\n`;
            });
        }

        text += `┃\n`;
        text += `┣━━━━━━━━━━━━━━━━━━━━━┫\n`;
        text += `┃ 📦 Total Commands : ${allCmds.length}\n`;
        text += `┃ ♻️ Prefix : ${prefix}\n`;
        text += `┃ 👨‍💻 Developer     : Azadx69x\n`;
        text += `╰━━━━━━━━━━━━━━━━━━━━━╯`;

        await client.sendMessage(chatId, text, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "👤 My Info", callback_data: "info" }]
                ]
            }
        });
    }
};
