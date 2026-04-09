import axios from "axios";
import fs from "fs-extra";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
    name: "pinterest",
    alias: ["pin"],
    version: "0.0.7",
    author: "Azadx69x",
    role: 0,
    description: "Search or get images from Pinterest",
    category: "image",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;
        try {
            const input = args.join(" ").trim();
            if (!input) return client.sendMessage(chatId, `❌ Usage: /pinterest <text> - [count]`);

            let query, count;
            if (input.includes("-")) {
                const parts = input.split("-");
                query = parts[0].trim();
                count = Number(parts[1]?.trim());
                if (!count || count <= 0) return client.sendMessage(chatId, `❌ Invalid count number.`);
            } else {
                query = input;
                count = "";
            }

            const apiUrl = `https://azadx69x.is-a.dev/api/pin?text=${encodeURIComponent(query)}${count ? `&count=${count}` : ""}`;
            const res = await axios.get(apiUrl);
            const data = res.data?.data || [];
            if (!data.length) return client.sendMessage(chatId, `❌ No images found for "${query}".`);

            const cacheDir = join(__dirname, "cache");
            await fs.ensureDir(cacheDir);

            const attachments = [];
            for (let i = 0; i < data.length; i++) {
                try {
                    const imgRes = await axios.get(data[i], { responseType: "arraybuffer" });
                    const imgPath = join(cacheDir, `pin_${Date.now()}_${i}.jpg`);
                    await fs.writeFile(imgPath, imgRes.data);
                    attachments.push(imgPath);
                } catch {}
            }

            let text = `╭━━━〔 📌 Pinterest Images 〕━━━╮\n`;
            text += `┃ Query : ${query}\n`;
            text += `┃ Count : ${attachments.length}\n`;
            text += `╰━━━━━━━━━━━━━━━━━━━━╯`;

            await client.sendMessage(chatId, text);

            for (const imgPath of attachments) {
                await client.sendPhoto(chatId, fs.createReadStream(imgPath));
                await fs.remove(imgPath);
            }

            await fs.remove(cacheDir);

        } catch {
            return client.sendMessage(chatId, `❌ Something went wrong. Please try again later.`);
        }
    }
};
