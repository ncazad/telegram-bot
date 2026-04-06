const startTime = Date.now();

export default {
    name: "uptime",
    alias: ["up", "runtime"],
    version: "1.0.0",
    author: "Azadx69x",
    role: 0,
    category: "utility",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;

        const ms   = Date.now() - startTime;
        const secs = Math.floor(ms / 1000) % 60;
        const mins = Math.floor(ms / 60000) % 60;
        const hrs  = Math.floor(ms / 3600000) % 24;
        const days = Math.floor(ms / 86400000);

        const uptime = `${days}d ${hrs}h ${mins}m ${secs}s`;

        const mem = process.memoryUsage();
        const mbUsed = (mem.heapUsed / 1024 / 1024).toFixed(2);
        const mbTotal = (mem.heapTotal / 1024 / 1024).toFixed(2);

        const text =
`⏱️ Bot Uptime
🕐 Uptime   : \`${uptime}\`
💾 Memory   : \`${mbUsed}MB / ${mbTotal}MB\`
🖥️ Platform : \`${process.platform}\`
📦 Node.js  : \`${process.version}\``;

        await client.sendMessage(chatId, text, { parse_mode: "Markdown" });
    }
};
