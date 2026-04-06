import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var baseApi = "https://azadx69x.is-a.dev/api/mj";

export default {
  name: "midjourney",
  alias: ["mj"],
  version: "1.0.0",
  author: "Azadx69x",
  role: 0,
  category: "ai",
  execute: async function(client, message, args) {
    var chatId = message.chat.id;
    var prompt = args.join(" ");
    if (prompt.length === 0) {
      return client.sendMessage(chatId, "❌ No prompt provided.");
    }
    try {
      var apiUrl = baseApi + "?prompt=" + encodeURIComponent(prompt);
      var response = await axios.get(apiUrl, { timeout: 45000 });
      var result = response.data;
      if (result.success === false) {
        return client.sendMessage(chatId, "❌ API returned no images.");
      }
      if (result.data === undefined) {
        return client.sendMessage(chatId, "❌ API returned no images.");
      }
      var images = result.data.images;
      if (images === undefined || images.length === 0) {
        return client.sendMessage(chatId, "❌ No images generated.");
      }
      var cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      var mediaGroup = [];
      for (var i = 0; i < images.length; i++) {
        var imgUrl = images[i];
        var imgRes = await axios.get(imgUrl, { responseType: "arraybuffer", timeout: 30000 });
        var imgPath = path.join(cacheDir, "mj_" + Date.now() + "_" + i + ".jpg");
        fs.writeFileSync(imgPath, Buffer.from(imgRes.data));
        mediaGroup.push({ type: "photo", media: imgPath });
      }
      if (mediaGroup.length === 1) {
        await client.sendPhoto(chatId, mediaGroup[0].media);
      } else if (mediaGroup.length > 1) {
        await client.sendMediaGroup(chatId, mediaGroup);
      }
      for (var j = 0; j < mediaGroup.length; j++) {
        fs.unlink(mediaGroup[j].media).catch(function() {});
      }
    } catch (err) {
      console.error("MJ error:", err.message);
      client.sendMessage(chatId, "❌ Failed to generate image.");
    }
  }
};
