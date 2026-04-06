export function escapeMarkdownV2(text) {
    if (!text) return ""
    return text.replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1")
}

export async function safeSend(bot, chatId, message, options = {}) {
    try {
        const escapedMessage = escapeMarkdownV2(message)
        return await bot.sendMessage(chatId, escapedMessage, {
            parse_mode: "MarkdownV2",
            ...options,
        })
    } catch (err) {
        console.error("Failed to send message:", err.response?.body || err.message)
        return null
    }
}
