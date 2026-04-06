import axios from "axios"
import { readFileSync } from "fs"
import { isBanned } from "../utils/database.js"
import logger from "../utils/logger.js"

const SUPPORTED = ["facebook.com", "fb.watch", "tiktok.com", "instagram.com", "youtu.be", "youtube.com"]
const URL_REGEX  = /(https?:\/\/[^\s]+)/g

function getConfig() {
    return JSON.parse(readFileSync(new URL("../config.json", import.meta.url)))
}

function extractSupportedUrl(text = "") {
    const matches = text.match(URL_REGEX)
    if (!matches) return null
    return matches.find(u => SUPPORTED.some(site => u.toLowerCase().includes(site))) || null
}

function registerAutoDownload(bot) {
    bot.on("message", async (msg) => {
        const config   = getConfig()
        if (!config.settings?.auto_download) return

        const chatType = msg.chat.type
        if (chatType !== "group" && chatType !== "supergroup") return

        const text = msg.text || msg.caption || ""
        const prefix = config.bot?.prefix || ")"
        if (text.startsWith(prefix)) return

        const url = extractSupportedUrl(text)
        if (!url) return

        const userId = msg.from?.id
        if (userId && isBanned(userId)) return

        const chatId = msg.chat.id

        logger.info(`Auto-download triggered in ${chatId} → ${url}`)

        const statusMsg = await bot.sendMessage(chatId, "⏳ Downloading video...", {
            reply_to_message_id: msg.message_id
        })

        try {
            const apiUrl = `https://azadx69x-alldl-cdi-bai.vercel.app/alldl?url=${encodeURIComponent(url)}&quality=sd`

            const response = await axios.get(apiUrl, {
                responseType: "stream",
                timeout: 60000,
                maxContentLength: 50 * 1024 * 1024,
                headers: { "Accept": "*/*", "Connection": "keep-alive" }
            })

            if (!response.data) throw new Error("Empty response from API")

            await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {})

            const site = SUPPORTED.find(s => url.toLowerCase().includes(s)) || "video"
            const shortUrl = url.length > 60 ? url.substring(0, 60) + "…" : url

            await bot.sendVideo(chatId, response.data, {
                caption: `🎬 *Auto Downloaded*\n🔗 ${shortUrl}`,
                parse_mode: "Markdown",
                supports_streaming: true,
                reply_to_message_id: msg.message_id
            })

        } catch (err) {
            logger.error(`Auto-download failed → ${err.message}`)
            await bot.editMessageText(
                "❌ Download failed.",
                { chat_id: chatId, message_id: statusMsg.message_id }
            ).catch(() => {})
        }
    })
}

export { registerAutoDownload }
