import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    name: "sing",
    alias: ["song", "music"],
    version: "0.0.8",
    author: "Azadx69x",
    role: 0,
    category: "media",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;

        if (!args[0]) {
            return client.sendMessage(chatId, "Please provide a song name.\n\nUsage: )sing <song name>");
        }

        const query = args.join(" ");
        const searching = await client.sendMessage(chatId, `Searching for: ${query}...`);

        let tempFile = null;
        try {
            const apiUrl = `https://azadx69x.is-a.dev/api/sing?song=${encodeURIComponent(query)}`;
            const res = await axios.get(apiUrl, { timeout: 30000 });
            const data = res.data;

            const audioUrl = data?.audio?.url || data?.url || data?.link;

            if (!audioUrl) {
                await client.editMessageText("Song not found. Try a different name.", {
                    chat_id: chatId,
                    message_id: searching.message_id
                }).catch(() => {});
                return;
            }

            await client.editMessageText("Downloading audio...", {
                chat_id: chatId,
                message_id: searching.message_id
            }).catch(() => {});

            const title    = data.info?.title    || data.title   || query;
            const artist   = data.info?.artist   || data.artist  || "Unknown";
            const ytUrl    = data.info?.youtubeUrl || data.youtubeUrl || null;
            const thumb    = data.info?.thumbnail  || data.thumbnail  || null;
            const quality  = data.audio?.quality   || "128K";

            await fs.ensureDir(path.join(__dirname, "../data"));
            tempFile = path.join(__dirname, "../data", `sing_${Date.now()}.mp3`);

            const audioRes = await axios({
                method: "get",
                url: audioUrl,
                responseType: "arraybuffer",
                timeout: 60000,
                maxContentLength: 50 * 1024 * 1024
            });
            await fs.writeFile(tempFile, audioRes.data);

            await client.deleteMessage(chatId, searching.message_id).catch(() => {});

            const caption = `${title}\nArtist: ${artist}\nQuality: ${quality}`;
            const reply_markup = ytUrl ? {
                inline_keyboard: [[{ text: "Play on YouTube", url: ytUrl }]]
            } : undefined;

            await client.sendAudio(chatId, tempFile, {
                title,
                performer: artist,
                caption,
                ...(reply_markup && { reply_markup })
            });

        } catch (err) {
            console.error("Sing error:", err.message);
            await client.editMessageText(
                `Failed to download song. Try again later.\nError: ${err.message}`,
                { chat_id: chatId, message_id: searching.message_id }
            ).catch(() => client.sendMessage(chatId, "Failed to download song. Try again later."));
        } finally {
            if (tempFile) setTimeout(() => fs.unlink(tempFile).catch(() => {}), 15000);
        }
    }
};
