export default {
    name: "unsend",
    alias: ["u", "r", "uns"],
    version: "0.0.7",
    author: "Azadx69x",
    role: 0,
    category: "utility",
    description: "Delete a bot message by replying to it",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;

        if (!message.reply_to_message) {
            return client.sendMessage(chatId, "🐸 Reply to a bot message to unsend it!");
        }

        const target = message.reply_to_message;
        const me = await client.getMe();

        if (target.from.id !== me.id) {
            return client.sendMessage(chatId, "🐸 Cannot unsend this message!");
        }

        try {
            await client.deleteMessage(chatId, target.message_id);
            await client.deleteMessage(chatId, message.message_id);
        } catch {
            return client.sendMessage(chatId, "⚠️ Failed to unsend the message.");
        }
    }
};
