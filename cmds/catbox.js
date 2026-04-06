import axios from "axios";

export default {
  name: "catbox",
  alias: ["cb"],
  version: "1.0.0",
  author: "Azadx69x",
  role: 0,
  category: "upload",
  execute: async (client, message, args) => {
    const chatId = message.chat.id;
    let mediaUrl = null;

    const urlArg = args.join(" ");
    if (urlArg && /^https?:\/\//i.test(urlArg)) {
      mediaUrl = urlArg;
    } else if (message.reply_to_message) {
      const reply = message.reply_to_message;
      let fileId = null;
      if (reply.photo) fileId = reply.photo[reply.photo.length - 1].file_id;
      else if (reply.video) fileId = reply.video.file_id;
      else if (reply.document) fileId = reply.document.file_id;
      if (fileId) {
        const fileInfo = await client.getFile(fileId);
        mediaUrl = "https://api.telegram.org/file/bot" + client.token + "/" + fileInfo.file_path;
      }
    } else {
      let fileId = null;
      if (message.photo) fileId = message.photo[message.photo.length - 1].file_id;
      else if (message.video) fileId = message.video.file_id;
      else if (message.document) fileId = message.document.file_id;
      if (fileId) {
        const fileInfo = await client.getFile(fileId);
        mediaUrl = "https://api.telegram.org/file/bot" + client.token + "/" + fileInfo.file_path;
      }
    }

    if (!mediaUrl) return client.sendMessage(chatId, "❌ No URL or media found.");

    try {
      const endpoint = "https://azadx69x.is-a.dev/api/catbox?url=" + encodeURIComponent(mediaUrl);
      const response = await axios.get(endpoint, { timeout: 20000 });
      const data = response.data;
      if (!data || !data.url) return client.sendMessage(chatId, "❌ Upload failed.");
      client.sendMessage(chatId, "✅ Upload Successful\n🔗 URL: " + data.url);
    } catch (err) {
      client.sendMessage(chatId, "❌ Error uploading media.");
    }
  }
};
