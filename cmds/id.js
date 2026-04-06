export default {
    name: "id",
    alias: ["uid", "myid"],
    version: "1.0.0",
    author: "Azadx69x",
    role: 0,
    category: "utility",

    execute: async (client, message, args) => {
        const chatId = message.chat.id
        const user = message.from
        const chat = message.chat
        const reply = message.reply_to_message

        let text = `🆔 ID Info\n${"─".repeat(22)}\n`
        text += `👤 Your ID   : \`${user.id}\`\n`
        text += `💬 Chat ID   : \`${chat.id}\`\n`
        text += `📌 Chat Type : ${chat.type}\n`

        if (reply) {
            const ru = reply.from
            text += `\n↩️ Replied User\n`
            text += `🆔 ID       : \`${ru.id}\`\n`
            text += `📛 Name     : ${[ru.first_name, ru.last_name].filter(Boolean).join(" ")}\n`
            text += `🔗 Username : ${ru.username ? "@" + ru.username : "—"}\n`
        }

        text += `${"─".repeat(22)}\n`

        await client.sendMessage(chatId, text, { parse_mode: "Markdown" })
    }
}
