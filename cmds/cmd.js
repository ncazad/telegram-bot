import { writeFileSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { loadSingleCommand, reloadAll, unloadCommand, getAllCommands } from "../handlers/commandLoader.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  name: "cmd",
  alias: ["command"],
  version: "1.1.0",
  author: "Azadx69x",
  category: "admin",
  role: 2,

  execute: async (client, message, args) => {
    const chatId = message.chat.id;
    const rawText = message.text || "";
    const sub = args[0]?.toLowerCase();
    const target = args[1]?.toLowerCase();

    // Help menu
    if (!sub) {
      const text = `🛠️ CMD MANAGER

Commands:

➥ install
   Install a new command from code

➥ load
   Load or reload a command

➥ unload
   Remove a command from memory

➥ loadall
   Reload all commands from disk

➥ list
   Show all loaded commands`;
      return client.sendMessage(chatId, text, { parse_mode: "Markdown" });
    }

    // ── INSTALL ──────────────────────────────────────────
    if (sub === "install") {
      if (!target) {
        return client.sendMessage(chatId, "❌ Usage: `)cmd install <file.js> <code>`", { parse_mode: "Markdown" });
      }
      const fileName = basename(target.endsWith(".js") ? target : target + ".js");
      if (fileName.includes("..") || !fileName.endsWith(".js")) {
        return client.sendMessage(chatId, "❌ Invalid filename. Must end with `.js`", { parse_mode: "Markdown" });
      }
      const prefixPattern = /^\S+\s+install\s+\S+\s*/i;
      const code = rawText.replace(prefixPattern, "");
      if (!code.trim()) {
        return client.sendMessage(chatId, "❌ No code provided.\n\nUsage: `)cmd install <file.js> <code>`", { parse_mode: "Markdown" });
      }
      const filePath = join(__dirname, fileName);
      try {
        writeFileSync(filePath, code, "utf8");
      } catch (err) {
        return client.sendMessage(chatId, `❌ Failed to save file: ${err.message}`);
      }
      const result = await loadSingleCommand(fileName.replace(".js", ""));
      if (result.ok) {
        return client.sendMessage(chatId, `✅ Command \`${result.cmd.name}\` installed & loaded successfully!\n📄 File: \`cmds/${fileName}\``, { parse_mode: "Markdown" });
      } else {
        return client.sendMessage(chatId, `⚠️ File saved as \`cmds/${fileName}\` but failed to load:\n\`${result.reason}\``, { parse_mode: "Markdown" });
      }
    }

    // ── LOADALL ──────────────────────────────────────────
    if (sub === "loadall") {
      const status = await client.sendMessage(chatId, "⏳ Reloading all commands...");
      try {
        const cmds = await reloadAll();
        await client.editMessageText(
          `✅ *${cmds.size} command(s) reloaded successfully!*`,
          { chat_id: chatId, message_id: status.message_id, parse_mode: "Markdown" }
        );
      } catch (err) {
        await client.editMessageText(
          `❌ Failed to reload: ${err.message}`,
          { chat_id: chatId, message_id: status.message_id }
        );
      }
      return;
    }

    // ── LOAD ─────────────────────────────────────────────
    if (sub === "load") {
      if (!target) return client.sendMessage(chatId, "❌ Usage: )cmd load <name>");
      const result = await loadSingleCommand(target);
      if (result.ok) {
        return client.sendMessage(chatId, `✅ Command \`${result.cmd.name}\` loaded successfully!`, { parse_mode: "Markdown" });
      } else {
        return client.sendMessage(chatId, `❌ Failed to load \`${target}\`: ${result.reason}`, { parse_mode: "Markdown" });
      }
    }

    // ── UNLOAD ───────────────────────────────────────────
    if (sub === "unload") {
      if (!target) return client.sendMessage(chatId, "❌ Usage: )cmd unload <name>");
      if (target === "cmd") return client.sendMessage(chatId, "❌ Cannot unload the cmd manager itself!");
      const ok = unloadCommand(target);
      if (ok) {
        return client.sendMessage(chatId, `✅ Command \`${target}\` unloaded successfully!`, { parse_mode: "Markdown" });
      } else {
        return client.sendMessage(chatId, `❌ Command \`${target}\` not found.`, { parse_mode: "Markdown" });
      }
    }

    // ── LIST ─────────────────────────────────────────────
    if (sub === "list") {
      const all = getAllCommands();
      const lines = all.map(c => `➥ \`${c.name}\` [${c.category || "general"}]`).join("\n");
      const text = `📋 LOADED COMMANDS\n\n${lines}\n\n📦 Total: ${all.length}`;
      return client.sendMessage(chatId, text, { parse_mode: "Markdown" });
    }

    // If no subcommand matched
    return client.sendMessage(chatId, `❌ Unknown subcommand: \`${sub}\`\nType )cmd for help.`, { parse_mode: "Markdown" });
  }
};
