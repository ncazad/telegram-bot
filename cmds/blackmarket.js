import axios from "axios";

const cmdsInfoUrl = "https://raw.githubusercontent.com/Azadwebapi/Azadx69x-bm-store/main/cmdsinfo.json";
const cmdsUrlJson = "https://raw.githubusercontent.com/Azadwebapi/Azadx69x-bm-store/main/cmdsurl.json";

const ITEMS_PER_PAGE = 10;

export default {
    name: "blackmarket",
    alias: ["bm", "cs"],
    version: "1.6",
    author: "Azadx69x",
    role: 0,
    category: "market",
    description: "Show blackmarket commands",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;

        try {
            const action = args[0]?.toLowerCase();

            if (!action) {
                return client.sendMessage(chatId,
`╭━━〔 🏴‍☠️ BLACK MARKET 〕━━╮
┃ Welcome to Black Market
┃
┃ • bm list <page>
┃ • bm show <cmd.js>
┃ • bm search <name>
╰━━━━━━━━━━━━━━━━━━━━━╯`
                );
            }

            const [infoRes, urlRes] = await Promise.all([
                axios.get(cmdsInfoUrl),
                axios.get(cmdsUrlJson)
            ]);

            let cmdsInfo = Array.isArray(infoRes.data) ? infoRes.data : infoRes.data.cmdName || [];
            const cmdsUrls = urlRes.data || {};

            if (action === "list") {
                if (!cmdsInfo.length) {
                    return client.sendMessage(chatId, "❌ No commands found!");
                }

                const page = Math.max(1, Number(args[1]) || 1);
                const totalPages = Math.ceil(cmdsInfo.length / ITEMS_PER_PAGE);

                if (page > totalPages) {
                    return client.sendMessage(chatId, `❌ Invalid page! 1-${totalPages}`);
                }

                const start = (page - 1) * ITEMS_PER_PAGE;
                const cmdsPage = cmdsInfo.slice(start, start + ITEMS_PER_PAGE);

                let text = `╭━━━〔 🏴‍☠️ COMMAND LIST 〕━━━╮\n`;

                cmdsPage.forEach((c, i) => {
                    text += `
┃ ${start + i + 1}. ${c.cmd}
┃ ⚙️ ${c.update}
┃ 👤 ${c.author}
┃ ─────────────────`;
                });

                text += `\n┃ 📊 Page ${page}/${totalPages}`;

                if (page < totalPages) {
                    text += `\n┃ ➤ bm list ${page + 1}`;
                }

                text += `\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

                return client.sendMessage(chatId, text);
            }

            if (action === "show") {
                const cmdName = args[1]?.toLowerCase()?.replace(".js", "");

                if (!cmdName) {
                    return client.sendMessage(chatId, "❌ Example: bm show cmd.js");
                }

                const cmd = cmdsInfo.find(c => c.cmd.toLowerCase() === cmdName);
                const cmdUrl = cmdsUrls[cmdName];

                if (!cmd || !cmdUrl) {
                    return client.sendMessage(chatId, `❌ Command "${cmdName}" not found!`);
                }

                const now = new Date().toLocaleString();

                const text =
`╭━━〔 ✅ CMD UPLOADED 〕━━╮
┃ 📌 Name   : ${cmdName}
┃ 👤 Author : ${cmd.author}
┃ 🕒 Time   : ${now}
┃ ⚡ Status : Uploaded
┃ 🔗 Link   :
┃ ${cmdUrl}
╰━━━━━━━━━━━━━━━━━━━━━╯`;

                return client.sendMessage(chatId, text);
            }

            if (action === "search") {
                const query = args[1]?.toLowerCase();

                if (!query) {
                    return client.sendMessage(chatId, "❌ Example: bm search name");
                }

                const results = cmdsInfo.filter(c =>
                    c.cmd.toLowerCase().includes(query)
                );

                if (!results.length) {
                    return client.sendMessage(chatId, "❌ No commands found!");
                }

                const page = Math.max(1, Number(args[2]) || 1);
                const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

                const start = (page - 1) * ITEMS_PER_PAGE;
                const cmdsPage = results.slice(start, start + ITEMS_PER_PAGE);

                let text = `╭━━〔 🔍 SEARCH RESULTS 〕━━╮\n`;
                text += `┃ Query : ${query}\n`;
                text += `┃ Total : ${results.length}\n┃\n`;

                cmdsPage.forEach((c, i) => {
                    text += `┃ ${start + i + 1}. ${c.cmd}\n`;
                });

                if (totalPages > 1) {
                    text += `┃\n┃ 📊 Page ${page}/${totalPages}`;
                    if (page < totalPages) {
                        text += `\n┃ ➤ bm search ${query} ${page + 1}`;
                    }
                }

                text += `\n╰━━━━━━━━━━━━━━━━━━━━━╯`;

                return client.sendMessage(chatId, text);
            }

            return client.sendMessage(chatId, "❌ Invalid option!");

        } catch (err) {
            return client.sendMessage(chatId, `❌ Error: ${err.message}`);
        }
    }
};
