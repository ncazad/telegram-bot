export default {
  name: "adduser",
  alias: ["unban", "add"],
  version: "1.0.0",
  author: "Azadx69x",
  role: 1,
  category: "group",

  execute: async (client, message, args) => {
    const chatId = message.chat.id;

    if (message.chat.type === "private") {
      return client.sendMessage(chatId, "❌ This command only works in groups.");
    }

    let targetId = null;
    let targetName = null;

    if (message.reply_to_message) {
      targetId = message.reply_to_message.from.id;
      targetName = message.reply_to_message.from.first_name;
    } else if (message.entities) {
      for (const e of message.entities) {
        if (e.type === "text_mention" && e.user?.id) {
          targetId = e.user.id;
          targetName = e.user.first_name;
          break;
        }
      }
    }

    if (!targetId && args[0] && /^\d+$/.test(args[0])) {
      targetId = parseInt(args[0]);
      targetName = `User ${targetId}`;
    }

    if (!targetId) {
      return client.sendMessage(
        chatId,
        "❌ Reply to a user, @mention them, or provide their ID.\n\nExample: `)adduser` (reply)"
      );
    }

    try {
      const botInfo = await client.getMe();
      const botMember = await client.getChatMember(chatId, botInfo.id);
      const canInvite = botMember.status === "administrator" && botMember.can_invite_users;
      const canBan = botMember.status === "administrator" && botMember.can_restrict_members;

      if (!canBan || !canInvite) {
        return client.sendMessage(
          chatId,
          "❌ Bot needs to be an admin with 'Ban Members' and 'Invite Users' permissions."
        );
      }

      await client.unbanChatMember(chatId, targetId);

      const inviteLink = await client.createChatInviteLink(chatId, {
        member_limit: 1,
        name: `Rejoin link for ${targetName || targetId}`
      });

      const link = inviteLink.invite_link;

      return client.sendMessage(
        chatId,
        `✅ ${targetName || targetId} has been unbanned!\n\n🔗 One-time rejoin link:\n${link}\n\n_This link can only be used once._`,
        { parse_mode: "Markdown" }
      );

    } catch (err) {
      console.error("Adduser error:", err.response?.body || err.message);
      return client.sendMessage(chatId, `❌ Failed: ${err.message}`);
    }
  }
};
