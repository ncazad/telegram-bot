import fs from "fs-extra";
import path from "path";

const RESTART_FILE = path.join(process.cwd(), "temp", ".restart_pending.json");

export default {
  name: "restart",
  alias: ["reboot"],
  version: "1.1.0",
  author: "Azadx69x",
  role: 2,
  category: "admin",

  execute: async (client, message, args) => {
    const chatId = message.chat.id;

    const sent = await client.sendMessage(chatId, "🔄 Restarting bot...");

    await fs.ensureDir(path.dirname(RESTART_FILE));
    await fs.writeJson(RESTART_FILE, {
      chatId,
      messageId: sent.message_id,
      startedAt: Date.now()
    });

    setTimeout(() => {
      process.exit(0);
    }, 1500);
  }
};
