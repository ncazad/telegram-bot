import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const userSessions = new Map();

const categoryMap = {
  "𝐀𝐙𝐀𝐃𝐗𝟔𝟗𝐗𝐅𝐅": "Azadx69xff",
  "𝐀𝐧𝐢𝐦𝐞": "anime",
  "𝐀𝐨𝐓": "aot",
  "𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞": "attitude",
  "𝐁𝐚𝐛𝐲": "baby",
  "𝐂𝐚𝐭": "cat",
  "𝐂𝐨𝐮𝐩𝐥𝐞": "couple",
  "𝐃𝐫𝐚𝐠𝐨𝐧𝐁𝐚𝐥𝐥": "dragonball",
  "𝐅𝐥𝐨𝐰𝐞𝐫": "flower",
  "𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥": "football",
  "𝐅𝐫𝐞𝐞𝐅𝐢𝐫𝐞": "freefire",
  "𝐅𝐫𝐢𝐞𝐧𝐝𝐬": "friends",
  "𝐅𝐮𝐧𝐧𝐲": "funny",
  "𝐇𝐨𝐫𝐧𝐲": "horny",
  "𝐇𝐨𝐭": "hot",
  "𝐈𝐬𝐥𝐚𝐦𝐢𝐜": "islamic",
  "𝐋𝐨𝐅𝐈": "lofi",
  "𝐋𝐨𝐯𝐞": "love",
  "𝐋𝐲𝐫𝐢𝐜𝐬": "lyrics",
  "𝐒𝐚𝐝": "sad"
};

const displayNames = Object.keys(categoryMap);
const itemsPerPage = 10;

const categoryMessages = {
  "Azadx69xff": "𝐀𝐙𝐀𝐃𝐗𝟔𝟗𝐗𝐅𝐅 𝐕𝐢𝐝𝐞𝐨 🐼",
  "anime":      "𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 🎌",
  "aot":        "𝐀𝐨𝐓 𝐕𝐢𝐝𝐞𝐨 ⚡",
  "attitude":   "𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨 ☠️",
  "baby":       "𝐁𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨 🐥",
  "cat":        "𝐂𝐚𝐭 𝐕𝐢𝐝𝐞𝐨 🐱",
  "couple":     "𝐂𝐨𝐮𝐩𝐥𝐞 𝐕𝐢𝐝𝐞𝐨 💑",
  "dragonball": "𝐃𝐫𝐚𝐠𝐨𝐧𝐁𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 🐉",
  "flower":     "𝐅𝐥𝐨𝐰𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 🌸",
  "football":   "𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 ⚽",
  "freefire":   "𝐅𝐫𝐞𝐞 𝐅𝐢𝐫𝐞 𝐕𝐢𝐝𝐞𝐨 🔥",
  "friends":    "𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐕𝐢𝐝𝐞𝐨 👭",
  "funny":      "𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 🤣",
  "horny":      "𝐇𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 🥵",
  "hot":        "𝟏𝟖+ 𝐕𝐢𝐝𝐞𝐨 💦",
  "islamic":    "𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨 🕋",
  "lofi":       "𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨 🎶",
  "love":       "𝐋𝐨𝐯𝐞 𝐕𝐢𝐝𝐞𝐨 🤍",
  "lyrics":     "𝐋𝐲𝐫𝐢𝐜𝐬 𝐕𝐢𝐝𝐞𝐨 🎵",
  "sad":        "𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨 😢"
};

async function getAlbumBaseUrl() {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/ncazad/Azad69x/main/baseApiUrl.json",
      { timeout: 10000 }
    );
    return res.data.album?.replace(/\/$/, "") || null;
  } catch (e) {
    console.error("[Album] Base URL fetch failed:", e.message);
    return null;
  }
}

async function fetchVideoUrls(category) {
  const base = await getAlbumBaseUrl();
  if (!base) throw new Error("Album API unavailable");

  const res = await axios.get(`${base}/api/album?category=${encodeURIComponent(category)}`, {
    timeout: 15000
  });

  let videos = [];
  if (res.data?.url) videos.push(res.data.url);
  if (res.data?.videos?.length) videos = videos.concat(res.data.videos);
  if (res.data?.data?.url) videos.push(res.data.data.url);
  if (res.data?.data?.videos?.length) videos = videos.concat(res.data.data.videos);
  if (Array.isArray(res.data)) videos = videos.concat(res.data);

  videos = videos.filter(u => typeof u === "string" && u.startsWith("http"));
  if (!videos.length) throw new Error(`No videos returned for: ${category}`);

  for (let i = videos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [videos[i], videos[j]] = [videos[j], videos[i]];
  }
  return videos;
}

async function downloadVideo(url) {
  const res = await axios({
    method: "get",
    url,
    responseType: "arraybuffer",
    timeout: 60000,
    maxContentLength: 50 * 1024 * 1024
  });
  return res.data;
}

async function sendVideo(client, chatId, userId, num) {
  const session = userSessions.get(userId);
  if (!session || num < 1 || num > session.categories.length) {
    return client.sendMessage(chatId, "Invalid number. Use )album to see the list first.");
  }
  const apiCategory = session.categories[num - 1];
  const displayName = session.displayNames[num - 1];

  const status = await client.sendMessage(chatId, `Fetching ${displayName} video...`);
  let tempFile = null;

  try {
    const urls = await fetchVideoUrls(apiCategory);
    let data = null;
    let lastErr = null;

    for (const url of urls.slice(0, 3)) {
      try {
        data = await downloadVideo(url);
        break;
      } catch (e) {
        lastErr = e;
        console.warn("[Album] URL failed:", url, e.message);
      }
    }

    if (!data) throw lastErr || new Error("All video URLs failed");

    await fs.ensureDir(path.join(__dirname, "../data"));
    tempFile = path.join(__dirname, "../data", `album_${Date.now()}.mp4`);
    await fs.writeFile(tempFile, data);

    await client.deleteMessage(chatId, status.message_id).catch(() => {});

    const caption = categoryMessages[apiCategory] || `${displayName} Video 🎬`;
    await client.sendVideo(chatId, tempFile, { caption, supports_streaming: true });

  } catch (err) {
    console.error("[Album] sendVideo error:", err.message);
    await client.editMessageText(
      `Failed to fetch video: ${err.message}`,
      { chat_id: chatId, message_id: status.message_id }
    ).catch(() => client.sendMessage(chatId, `Failed to fetch video: ${err.message}`));
  } finally {
    if (tempFile) setTimeout(() => fs.unlink(tempFile).catch(() => {}), 15000);
  }
}

export default {
  name: "album",
  alias: ["al"],
  version: "0.0.4",
  author: "Azadx69x",
  role: 0,
  category: "media",

  execute: async (client, message, args) => {
    const chatId = message.chat.id;
    const userId = message.from.id;

    if (args.length > 0 && !isNaN(parseInt(args[0]))) {
      return sendVideo(client, chatId, userId, parseInt(args[0]));
    }

    let page = parseInt(args[0]) || 1;
    const totalPages = Math.ceil(displayNames.length / itemsPerPage);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * itemsPerPage;
    const pageDisplayNames = displayNames.slice(start, start + itemsPerPage);
    const pageApiCategories = pageDisplayNames.map(cat => categoryMap[cat]);

    let text = `🎀 𝐀𝐥𝐛𝐮𝐦 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬 (𝐏𝐚𝐠𝐞 ${page}/${totalPages}) 🎀\n\n`;
    pageDisplayNames.forEach((cat, idx) => {
      text += `${start + idx + 1}. ${cat}\n`;
    });
    text += `\n📌 Reply with a number to get a video.\nOr: )album <number>`;
    if (page < totalPages) text += `\n📄 Next: )album ${page + 1}`;
    if (page > 1) text += `\n📄 Prev: )album ${page - 1}`;

    const sent = await client.sendMessage(chatId, text);

    userSessions.set(userId, {
      messageId: sent.message_id,
      categories: pageApiCategories,
      displayNames: pageDisplayNames,
      page
    });

    setTimeout(() => {
      if (userSessions.get(userId)?.messageId === sent.message_id) {
        userSessions.delete(userId);
      }
    }, 300000);
  },

  Reply: async (client, message, replyToMessageId) => {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = (message.text || "").trim();
    const num = parseInt(text);
    if (isNaN(num)) return;
    const session = userSessions.get(userId);
    if (!session || session.messageId !== replyToMessageId) return;
    await sendVideo(client, chatId, userId, num);
  }
};
