import globalDb from "../database/global.js";

const WL_KEY = "whitelist";

async function getWL() {
  const data = await globalDb.get(WL_KEY);
  return data || { enabled: false, users: [] };
}

async function saveWL(data) {
  await globalDb.set(WL_KEY, data);
}

export async function isWhitelisted(userId) {
  const wl = await getWL();
  if (!wl.enabled) return true;
  return wl.users.includes(String(userId));
}

export async function isWLEnabled() {
  const wl = await getWL();
  return wl.enabled;
}

function resolveTargetId(message, args) {
  if (message.reply_to_message?.from?.id) {
    return String(message.reply_to_message.from.id);
  }
  if (message.entities) {
    for (const entity of message.entities) {
      if (entity.type === "text_mention" && entity.user?.id) {
        return String(entity.user.id);
      }
    }
  }
  const mention = args.find(a => a.startsWith("@"));
  if (mention) return mention;
  const numId = args.find(a => /^\d+$/.test(a));
  if (numId) return numId;
  return null;
}

export default {
  name: "whitelist",
  alias: ["wl"],
  version: "1.0.0",
  author: "Azadx69x",
  role: 2,
  category: "admin",

  execute: async (client, message, args) => {
    const chatId = message.chat.id;
    const sub = (args[0] || "").toLowerCase();

    if (!sub) {
      const wl = await getWL();
      return client.sendMessage(
        chatId,
        `🛡️ Whitelist Info\n\nStatus: ${wl.enabled ? "✅ ON" : "❌ OFF"}\nUsers: ${wl.users.length}\n\nUsage:\n• wl on / off\n• wl add (reply or @mention)\n• wl remove (reply or @mention)\n• wl list`,
        { parse_mode: "Markdown" }
      );
    }

    if (sub === "on") {
      const wl = await getWL();
      if (wl.enabled) {
        return client.sendMessage(chatId, "⚠️ Whitelist is already ON.");
      }
      wl.enabled = true;
      await saveWL(wl);
      return client.sendMessage(chatId, "✅ Whitelist ON — only bot admins and whitelisted users can use the bot.");
    }

    if (sub === "off") {
      const wl = await getWL();
      if (!wl.enabled) {
        return client.sendMessage(chatId, "⚠️ Whitelist is already OFF.");
      }
      wl.enabled = false;
      await saveWL(wl);
      return client.sendMessage(chatId, "❌ Whitelist OFF — everyone can use the bot.");
    }

    if (sub === "add") {
      const targetId = resolveTargetId(message, args.slice(1));
      if (!targetId) {
        return client.sendMessage(chatId, "⚠️ Reply to a user or mention them to add to whitelist.");
      }
      const wl = await getWL();
      if (wl.users.includes(String(targetId))) {
        return client.sendMessage(chatId, `⚠️ User \`${targetId}\` is already whitelisted.`, { parse_mode: "Markdown" });
      }
      wl.users.push(String(targetId));
      await saveWL(wl);
      return client.sendMessage(chatId, `✅ Added \`${targetId}\` to whitelist.`, { parse_mode: "Markdown" });
    }

    if (sub === "remove") {
      const targetId = resolveTargetId(message, args.slice(1));
      if (!targetId) {
        return client.sendMessage(chatId, "⚠️ Reply to a user or mention them to remove from whitelist.");
      }
      const wl = await getWL();
      if (!wl.users.includes(String(targetId))) {
        return client.sendMessage(chatId, `⚠️ User \`${targetId}\` is not in whitelist.`, { parse_mode: "Markdown" });
      }
      wl.users = wl.users.filter(u => u !== String(targetId));
      await saveWL(wl);
      return client.sendMessage(chatId, `❌ Removed \`${targetId}\` from whitelist.`, { parse_mode: "Markdown" });
    }

    if (sub === "list") {
      const wl = await getWL();
      if (!wl.users.length) {
        return client.sendMessage(chatId, "📋 Whitelist is empty.");
      }
      const list = wl.users.map((uid, i) => `${i + 1}. \`${uid}\``).join("\n");
      return client.sendMessage(chatId, `📋 Whitelisted Users:\n\n${list}`, { parse_mode: "Markdown" });
    }

    return client.sendMessage(chatId, "❓ Unknown subcommand. Use: on, off, add, remove, list");
  }
};
