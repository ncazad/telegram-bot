export default {
    name: "uid",
    version: "1.0.0",
    author: "Azadx69x",
    role: 0,
    category: "utility",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;
        const userId = message.reply_to_message?.from?.id || message.from.id;

        await client.sendMessage(chatId, `${userId}`);
    }
};
