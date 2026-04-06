import axios from "axios";

export default {
  name: "alldl",
  alias: ["download", "dl"],
  version: "0.0.1",
  author: "Azadx69x",
  role: 0,
  category: "media",

  execute: async (client, message, args) => {
    const chatId = message.chat.id;
    let url = null;

    if (args[0]) {
      url = args[0];
    }
    else if (message.reply_to_message) {
      const replyText = message.reply_to_message.text || message.reply_to_message.caption || "";
      const match = replyText.match(/(https?:\/\/[^\s]+)/g);
      if (match) url = match[0];
    }
    else if (message.text) {
      const match = message.text.match(/(https?:\/\/[^\s]+)/g);
      if (match) url = match[0];
    }

    if (!url) {
      return client.sendMessage(chatId, "❌ No URL found!");
    }

    const supported = ["facebook", "fb.watch", "tiktok", "instagram", "youtu", "youtube"];
    if (!supported.some(site => url.toLowerCase().includes(site))) {
      return client.sendMessage(chatId, "❌ Unsupported URL. Please provide a link from Facebook, TikTok, Instagram, or YouTube.");
    }

    const statusMsg = await client.sendMessage(chatId, "⏳ Downloading video...");

    try {
      const quality = args.includes("hd") ? "hd" : "sd";
      const apiUrl = `https://azadx69x-alldl-cdi-bai.vercel.app/alldl?url=${encodeURIComponent(url)}&quality=${quality}`;

      const response = await axios.get(apiUrl, {
        responseType: "stream",
        timeout: 60000,
        maxContentLength: 50 * 1024 * 1024,
        headers: {
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      });

      if (!response.data) throw new Error("Empty response from API");

      await client.deleteMessage(chatId, statusMsg.message_id).catch(() => {});

      const videoStream = response.data;

      await client.sendVideo(chatId, videoStream, {
        caption: `✅ Downloaded from:\n${url.length > 100 ? url.substring(0, 100) + "…" : url}\n🎬 Quality: ${quality.toUpperCase()}`,
        supports_streaming: true
      });

    } catch (error) {
      console.error("alldl error:", error.message);
      await client.editMessageText(
        "❌ Download failed. Please check the URL or try again later.",
        { chat_id: chatId, message_id: statusMsg.message_id }
      ).catch(() => client.sendMessage(chatId, "❌ Download failed."));
    }
  }
};
