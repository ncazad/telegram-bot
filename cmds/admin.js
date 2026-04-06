import fs from "fs-extra";
import path from "path";
import { safeSend } from "../utils/safeSend.js";

const configPath = path.join(process.cwd(), "config.json");

let botConfig = { adminBot: [] };
if (fs.existsSync(configPath)) {
  botConfig = fs.readJsonSync(configPath);
}

const saveConfig = () => {
  fs.writeJsonSync(configPath, botConfig, { spaces: 2 });
};

export default {
  name: "admin",
  alias: ["ad"],
  version: "0.0.1",
  author: "Azadx69x",
  role: 2,
  category: "admin",

  execute: async (client, message, args) => {
    const chatId = message.chat.id;
    const senderId = message.from.id;
    const isOwner = senderId === process.env.BOT_OWNER_ID;

    if (!isOwner && (args[0] === "add" || args[0] === "remove")) {
      return await safeSend(client, chatId, "⛔ You are not allowed to use this!");
    }

    const getName = async (userId) => {
      try {
        const chat = await client.getChat(chatId);
        const member = await chat.getMember(userId);
        return member.user.first_name || "Unknown";
      } catch {
        return "Unknown";
      }
    };

    const formatAdmin = async (uid) => {
      const name = await getName(uid);
      return `🎀 Name: ${name}\n🪪 UID: ${uid}`;
    };

    if (args[0] === "list" || args[0] === "-l") {
      if (!botConfig.adminBot.length) {
        return await safeSend(client, chatId, "⚠️ No Admins Found!");
      }
      const adminList = await Promise.all(botConfig.adminBot.map(formatAdmin));
      const messageText = adminList.join("\n\n");
      return await safeSend(client, chatId, messageText);
    }

    let uids = [];

    if (message.entities) {
      const mentionEntities = message.entities.filter(e => e.type === "mention" || e.type === "text_mention");
      for (const entity of mentionEntities) {
        if (entity.type === "text_mention") {
          uids.push(entity.user.id.toString());
        } else if (entity.type === "mention") {
          const username = message.text.slice(entity.offset, entity.offset + entity.length);
          try {
            const chat = await client.getChat(chatId);
            const members = await chat.getMembers();
            const user = members.find(m => m.user.username === username.slice(1));
            if (user) uids.push(user.user.id.toString());
          } catch {}
        }
      }
    }

    if (message.reply_to_message) {
      uids.push(message.reply_to_message.from.id.toString());
    }

    if (!uids.length && args.length > 1) {
      uids = args.slice(1).filter(a => /^\d+$/.test(a));
    }

    uids = [...new Set(uids)];

    if (args[0] === "add" || args[0] === "-a") {
      if (!uids.length) {
        return await safeSend(client, chatId, "⚠️ Tag/reply/UID needed to add admin.");
      }

      const newAdmins = [];
      const alreadyAdmins = [];

      for (const uid of uids) {
        if (botConfig.adminBot.includes(uid)) {
          alreadyAdmins.push(uid);
        } else {
          newAdmins.push(uid);
        }
      }

      botConfig.adminBot.push(...newAdmins);
      saveConfig();

      let reply = "";
      if (newAdmins.length) {
        const newList = await Promise.all(newAdmins.map(formatAdmin));
        reply += `✅ Added Admin:\n${newList.join("\n\n")}`;
      }
      if (alreadyAdmins.length) {
        const alreadyList = await Promise.all(alreadyAdmins.map(formatAdmin));
        reply += (reply ? "\n\n" : "") + `⚠️ Already Admin:\n${alreadyList.join("\n\n")}`;
      }
      return await safeSend(client, chatId, reply);
    }

    if (args[0] === "remove" || args[0] === "-r") {
      if (!uids.length) {
        return await safeSend(client, chatId, "⚠️ Tag/reply/UID needed to remove admin.");
      }

      const removed = [];
      const notAdmins = [];

      for (const uid of uids) {
        if (botConfig.adminBot.includes(uid)) {
          removed.push(uid);
          botConfig.adminBot = botConfig.adminBot.filter(id => id !== uid);
        } else {
          notAdmins.push(uid);
        }
      }

      saveConfig();

      let reply = "";
      if (removed.length) {
        const removedList = await Promise.all(removed.map(formatAdmin));
        reply += `❌ Removed Admin:\n${removedList.join("\n\n")}`;
      }
      if (notAdmins.length) {
        const notList = await Promise.all(notAdmins.map(formatAdmin));
        reply += (reply ? "\n\n" : "") + `⚠️ Not Admin:\n${notList.join("\n\n")}`;
      }
      return await safeSend(client, chatId, reply);
    }

    return await safeSend(client, chatId, "Use: list / add / remove");
  }
};
