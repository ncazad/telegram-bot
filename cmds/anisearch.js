import axios from "axios";
import fs from "fs-extra";
import path from "path";

const randomCharacters = [
  "naruto", "sasuke", "goku", "luffy", "ichigo", "eren", "levi",
  "zoro", "kakashi", "itachi", "obito", "minato", "gojo", "sukuna",
  "tanjiro", "zenitsu", "inosuke", "nezuko", "asta", "yuno",
  "natsu", "erza", "gray", "killua", "gon", "kurapika", "leorio",
  "light", "l lawliet", "ryuk", "rem", "zero two", "hisoka",
  "edward elric", "alphonse", "roy mustang", "spike spiegel",
  "shinji ikari", "rei ayanami", "asuka", "mikasa", "armin",
  "todoroki", "bakugo", "deku", "allmight", "endeavor"
];

export default {
  name: "anisearch",
  alias: ["anime"],
  version: "0.0.4",
  author: "Azadx69x",
  role: 0,
  category: "anime",

  execute: async (client, message, args) => {
    const chatId = message.chat.id;

    let character = args.join(" ").trim();

    if (!character) {
      character = randomCharacters[Math.floor(Math.random() * randomCharacters.length)];
    }

    try {
      const apiUrl = `https://azadx69x.is-a.dev/api/anisearch?character=${encodeURIComponent(character)}`;
      const response = await axios.get(apiUrl, { timeout: 15000 });

      if (!response.data || !response.data.success) {
        return client.sendMessage(
          chatId,
          `❌ ${response.data?.message || "No video found"}`
        );
      }

      const video = response.data.data;

      if (video.duration && parseInt(video.duration) > 60) {
        return client.sendMessage(chatId, "❌ Video too long (max 60 seconds)");
      }

      let videoUrl = video.video_url || video.url;

      if (!videoUrl || !videoUrl.startsWith("http")) {
        return client.sendMessage(chatId, "❌ Invalid video URL");
      }

      videoUrl = videoUrl.replace(/^\[|\]$/g, "");

      const tempDir = path.join(process.cwd(), "temp");
      await fs.ensureDir(tempDir);

      const filePath = path.join(tempDir, `anisearch_${Date.now()}.mp4`);

      const videoRes = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream",
        timeout: 30000
      });

      const writer = fs.createWriteStream(filePath);
      videoRes.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await client.sendVideo(chatId, fs.createReadStream(filePath), {
        caption: `🎌 Character: ${character}`
      });

      try {
        await fs.unlink(filePath);
      } catch (e) {
        console.log("Delete error:", e.message);
      }

    } catch (error) {
      console.error("Anisearch error:", error.message);

      await client.sendMessage(
        chatId,
        `❌ Failed: ${error.message}`
      );
    }
  }
};
