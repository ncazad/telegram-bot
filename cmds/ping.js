export default {
    name: "ping",
    version: "1.0.0",
    author: "Azadx69x",
    role: 0,
    category: "utility",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;
        const start = Date.now();

        const sent = await client.sendMessage(chatId, "🏓 Pinging...");

        const ping = Date.now() - start;
        const bar = ping < 100 ? "🟢 Fast" : ping < 300 ? "🟡 Normal" : "🔴 Slow";

        const text =
`┍━━━[ 🏓 PONG! ]━━━◊
┋⚡ Response : \`${ping}ms\`
┋📶 Status   : ${bar}
┕━━━━━━━━━━━━━━━━◊`;

        await client.editMessageText(text, {
            chat_id: chatId,
            message_id: sent.message_id,
            parse_mode: "Markdown"
        });
    }
};
