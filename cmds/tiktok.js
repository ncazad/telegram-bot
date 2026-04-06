import axios from "axios";

export default {
  name: "tiktok",
  alias: ["tt", "tiktok"],
  version: "0.0.1",
  author: "Azadx69x",
  role: 0,
  category: "media",

  execute: async (client, message, args) => {
    const chatId = message.chat.id;
    if (!args[0]) {
      return client.sendMessage(
        chatId,
        "❌ Please provide a search keyword"
      );
    }

    const query = args.join(" ");
    const searching = await client.sendMessage(chatId, "⏳ Searching TikTok...");

    try {
      const apiUrl = `https://azadx69x-tiktok-api.vercel.app/tiktok/search?query=${encodeURIComponent(query)}`;
      const res = await axios.get(apiUrl, { timeout: 30000 });
      const data = res.data;

      const videos = data?.list || [];
      if (!videos.length) {
        await client.editMessageText("❌ No TikTok videos found", {
          chat_id: chatId,
          message_id: searching.message_id,
        }).catch(() => {});
        return;
      }

      const firstVideo = videos[0];
      const videoUrl = firstVideo.noWatermark || firstVideo.play || firstVideo.wmplay;
      if (!videoUrl) throw new Error("No video URL found");

      await client.deleteMessage(chatId, searching.message_id).catch(() => {});

      const title = firstVideo.title?.slice(0, 200) || "TikTok Video";
      const authorName = firstVideo.author?.unique_id || "Unknown";
      const caption = `🎵 ${title}\n👤 Author: @${authorName}`;

      await client.sendVideo(chatId, videoUrl, {
        caption: caption,
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("TikTok error:", error);
      await client.editMessageText(
        "❌ An error occurred, please try again later",
        { chat_id: chatId, message_id: searching.message_id }
      ).catch(() => client.sendMessage(chatId, "❌ An error occurred, please try again later"));
    }
  },
};