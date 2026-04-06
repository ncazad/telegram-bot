export default {
  name: "pfp",
  alias: ["pp"],
  version: "1.0.1",
  author: "Azadx69x",
  role: 0,
  category: "image",

  execute: async (client, message, args) => {
    const chatId = message.chat.id;

    try {
      let userId, userName;

      if (message.reply_to_message) {
        userId = message.reply_to_message.from.id;
        const u = message.reply_to_message.from;
        userName = u.first_name + (u.last_name ? " " + u.last_name : "");
      } else {
        userId = message.from.id;
        const u = message.from;
        userName = u.first_name + (u.last_name ? " " + u.last_name : "");
      }

      const photos = await client.getUserProfilePhotos(userId, { limit: 1 });

      if (!photos || photos.total_count === 0) {
        return client.sendMessage(chatId, `${userName} has no profile photo.`);
      }

      const best = photos.photos[0];
      const fileId = best[best.length - 1].file_id;

      await client.sendPhoto(chatId, fileId, {
        caption: `Profile photo of ${userName}`
      });

    } catch (err) {
      console.error("pfp error:", err.message);
      return client.sendMessage(chatId, "Could not fetch profile picture. The user may have privacy restrictions.");
    }
  }
};
