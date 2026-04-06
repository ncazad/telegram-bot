import axios from "axios";

const baseApi = "https://azadx69x.is-a.dev/api/prompt";

export default {
  name: "prompt",
  alias: ["p"],
  version: "1.0.0",
  author: "Azadx69x",
  role: 0,
  category: "ai",
  execute: async (client, message, args) => {
    const chatId = message.chat.id;
    let imageUrl = null;

    if (message.reply_to_message) {
      const reply = message.reply_to_message;
      if (reply.photo && reply.photo.length > 0) {
        const fileId = reply.photo[reply.photo.length - 1].file_id;
        const fileInfo = await client.getFile(fileId);
        imageUrl = "https://api.telegram.org/file/bot" + client.token + "/" + fileInfo.file_path;
      }
    } else if (message.photo && message.photo.length > 0) {
      const fileId = message.photo[message.photo.length - 1].file_id;
      const fileInfo = await client.getFile(fileId);
      imageUrl = "https://api.telegram.org/file/bot" + client.token + "/" + fileInfo.file_path;
    } else if (args.length > 0 && args[0].match(/^https?:\/\//i)) {
      imageUrl = args[0];
    }

    if (!imageUrl) return client.sendMessage(chatId, "❌ No image.");

    try {
      const apiUrl = baseApi + "?url=" + encodeURIComponent(imageUrl);
      const response = await axios.get(apiUrl, { timeout: 20000 });
      const prompt = response.data?.data?.prompt;
      if (!prompt) return client.sendMessage(chatId, "❌ No prompt.");
      return client.sendMessage(chatId, prompt);
    } catch {
      return client.sendMessage(chatId, "❌ Failed.");
    }
  }
};
