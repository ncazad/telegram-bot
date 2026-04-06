import { getAllCommands } from "../handlers/commandLoader.js";

const CAT_EMOJI = {
    general: "📌",
    media: "🎵",
    fun: "🎉",
    utility: "🛠️",
    info: "ℹ️",
    game: "🎮",
    admin: "🛡️",
    ai: "🤖"
};

export default {
    name: "help",
    alias: ["cmds", "commands"],
    version: "1.0.0",
    author: "Azadx69x",
    role: 0,
    category: "general",
    description: "Shows a clean list of all commands or info about a specific command.",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;
        const allCmds = getAllCommands();

        if (args[0]) {
            const query = args[0].toLowerCase();
            const cmd = allCmds.find(c => c.name === query || c.alias?.includes(query));
            if (!cmd) {
                return client.sendMessage(chatId, `❌ Command not found: *${query}*`, { parse_mode: "Markdown" });
            }

            const emoji = CAT_EMOJI[cmd.category] || "📌";

            const infoText = `
┍━━━[ ${emoji} COMMAND INFO ]━━━◊
┋✨ Name: /${cmd.name}
┋💡 Aliases: ${cmd.alias?.length ? cmd.alias.join(", ") : "None"}
┋🗂️ Category: ${cmd.category || "general"}
┋⚡ Version: ${cmd.version || "1.0.0"}
┋👤 Author: ${cmd.author || "Unknown"}
┕━━━━━━━━━━━━━━━━◊
`;
            return client.sendMessage(chatId, infoText, { parse_mode: "Markdown" });
        }

        const categories = {};
        for (const cmd of allCmds) {
            const cat = cmd.category || "general";
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd);
        }

        let text = `┍━━━[ HELP MENU ]━━━◊\n`;

        for (const [cat, cmds] of Object.entries(categories)) {
            const emoji = CAT_EMOJI[cat] || "📌";
            text += `┋${emoji} ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n`;
            for (const cmd of cmds) {
                const al = cmd.alias?.length ? ` (_${cmd.alias.join(", ")}_)` : "";
                text += `┋➥ /${cmd.name}${al}\n`;
            }
            text += "┋\n";
        }

        text += `┕━━━━━━━━━━━━━━━━◊\n`;
        text += `┋📦 Total: ${allCmds.length}\n`;
        text += `┋👨‍💻 Dev: Azadx69x\n`;
        text += `┕━━━━━━━━━━━━━━━━◊`;

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
