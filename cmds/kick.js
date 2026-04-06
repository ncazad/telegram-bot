export default {
  name: "kick",
  version: "1.0.0",
  author: "Azadx69x",
  role: 1,
  category: "group",
  execute: async (client, message, args) => {
    const chatId = message.chat.id;
    let target = null;

    if (message.reply_to_message) {
      target = message.reply_to_message.from.id;
    } else if (message.entities) {
      for (const e of message.entities) {
        if (e.type === "text_mention") {
          target = e.user.id;
          break;
        }
      }
    }

    if (!target && args[0] && !isNaN(parseInt(args[0]))) {
      target = parseInt(args[0]);
    }

    if (!target) {
      return client.sendMessage(chatId, "❌ Reply to a user, mention them, or provide their ID.");
    }

    try {
      const botInfo = await client.getMe();
      const botMember = await client.getChatMember(chatId, botInfo.id);
      const canKick = botMember.status === "administrator" && botMember.can_restrict_members;
      if (!canKick) {
        return client.sendMessage(chatId, "❌ Bot needs to be an admin with 'Ban Members' permission.");
      }

      await client.banChatMember(chatId, target);
      await client.unbanChatMember(chatId, target);
      return client.sendMessage(chatId, "✅ User kicked successfully.");
    } catch (err) {
      console.error("Kick error:", err.response?.body || err.message);
      return client.sendMessage(chatId, `❌ Failed to kick: ${err.message}`);
    }
  }
};
