import axios from "axios";

export default {
  name: "anihot",
  alias: ["18+"],
  version: "0.0.1",
  author: "Azadx69x",
  role: 0,
  category: "18+",

  execute: async (client, message, args) => {
    const chatId = message.chat.id;

    try {
      const apiUrl = "https://azadx69x.is-a.dev/api/anihot";
      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 15000
      });
      
      const imageBuffer = Buffer.from(response.data, "binary");

      await client.sendPhoto(chatId, imageBuffer, {
        caption: "😋 Anime Hot Image"
      });
    } catch (err) {
      console.error("Anihot error:", err.message);
      return client.sendMessage(chatId, "❌ Failed to fetch image. Try again later.");
    }
  }
};
