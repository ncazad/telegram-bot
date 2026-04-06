import TelegramBot from "node-telegram-bot-api";
import { readFileSync } from "fs";
import axios from "axios";
import express from "express";
import fs from "fs-extra";
import path from "path";
import { setupWebsite } from "./web/site.js";

import { loadCommands } from "./handlers/commandLoader.js";
import { registerCommands } from "./handlers/commands.js";
import { registerAdminCommands } from "./handlers/admin.js";
import { registerAutoDownload } from "./handlers/autodownload.js";
import { connectMongo } from "./database/mongodb.js";
import { applyBoldFont } from "./utils/font.js";
import logger from "./utils/logger.js";
import { printBanner } from "./utils/banner.js";

const config = JSON.parse(
  readFileSync(new URL("./config.json", import.meta.url))
);

const token = process.env.BOT_TOKEN || config?.bot?.token;

if (!token || token === "") {
  logger.error("Bot token not set! Set BOT_TOKEN env var.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

await connectMongo();

async function clearWebhook() {
  try {
    await axios.get(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`);
    logger.success("Webhook cleared");
  } catch {
    logger.warn("Could not clear webhook");
  }
}

await clearWebhook();
await new Promise(r => setTimeout(r, 5000));

const bot = new TelegramBot(token, {
  polling: {
    interval: 1000,
    autoStart: false,
    params: { timeout: 10 },
  },
});

function patchBotExtras(bot, token) {
  bot.setMessageReaction = async (chatId, messageId, emoji = "👍", isBig = false) => {
    try {
      await axios.post(`https://api.telegram.org/bot${token}/setMessageReaction`, {
        chat_id: chatId,
        message_id: messageId,
        reaction: emoji ? [{ type: "emoji", emoji }] : [],
        is_big: isBig
      });
    } catch (e) {
      console.error("setMessageReaction error:", e.response?.data?.description || e.message);
    }
  };
}

function patchBotFont(bot) {
  const wrapText = (text) => {
    if (typeof text !== "string") return text;
    return applyBoldFont(text);
  };

  const origSend = bot.sendMessage.bind(bot);
  bot.sendMessage = (chatId, text, opts) =>
    origSend(chatId, wrapText(text), opts);

  const origEdit = bot.editMessageText.bind(bot);
  bot.editMessageText = (text, opts) =>
    origEdit(wrapText(text), opts);

  const origSendPhoto = bot.sendPhoto.bind(bot);
  bot.sendPhoto = (chatId, photo, opts = {}) => {
    if (opts.caption) opts = { ...opts, caption: wrapText(opts.caption) };
    return origSendPhoto(chatId, photo, opts);
  };

  const origSendAudio = bot.sendAudio.bind(bot);
  bot.sendAudio = (chatId, audio, opts = {}) => {
    if (opts.caption) opts = { ...opts, caption: wrapText(opts.caption) };
    return origSendAudio(chatId, audio, opts);
  };

  const origSendVideo = bot.sendVideo.bind(bot);
  bot.sendVideo = (chatId, video, opts = {}) => {
    if (opts.caption) opts = { ...opts, caption: wrapText(opts.caption) };
    return origSendVideo(chatId, video, opts);
  };

  const origSendDoc = bot.sendDocument.bind(bot);
  bot.sendDocument = (chatId, doc, opts = {}) => {
    if (opts.caption) opts = { ...opts, caption: wrapText(opts.caption) };
    return origSendDoc(chatId, doc, opts);
  };
}

patchBotExtras(bot, token);
patchBotFont(bot);

const username = config?.bot?.username || "Unknown";
const admins = config?.admins || [];
const version = config?.credits?.version || "2.0.0";
const madeBy = config?.credits?.made_by || "Azadx69x";

await printBanner(username, version, admins, madeBy);

await loadCommands();

registerCommands(bot);
registerAdminCommands(bot);
registerAutoDownload(bot);
setupWebsite(app, bot, config);

let polling = false;

async function startPolling() {
  if (polling) {
    try { await bot.stopPolling(); } catch {}
    polling = false;
  }

  await clearWebhook();
  await new Promise(r => setTimeout(r, 3000));

  try {
    logger.info("Starting polling...");
    await bot.startPolling();
    polling = true;
    logger.success("Polling started");
  } catch (err) {
    logger.error(`Polling failed to start: ${err.message}`);
    logger.info("Retrying in 20s...");
    setTimeout(startPolling, 20000);
  }
}

bot.on("polling_error", async (err) => {
  const msg = err.message || String(err);

  if (msg.includes("409") || msg.includes("Conflict")) {
    logger.warn("409 Conflict — waiting 20s then retrying...");
    polling = false;
    try { await bot.stopPolling(); } catch {}
    setTimeout(startPolling, 20000);
  } else if (msg.includes("EFATAL") || msg.includes("ECONNRESET")) {
    logger.warn(`Connection issue: ${msg} — retrying in 10s...`);
    polling = false;
    setTimeout(startPolling, 10000);
  } else {
    logger.error(`Polling error: ${msg}`);
  }
});

bot.on("error", (err) => {
  logger.error(`Bot error: ${err.message}`);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception: " + err.message);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection: " + err);
});

await startPolling();

logger.success("Bot is online!");
logger.info(`Prefix: ${config?.bot?.prefix || ")"}`);

const RESTART_FILE = path.join(process.cwd(), "temp", ".restart_pending.json");
try {
  if (await fs.pathExists(RESTART_FILE)) {
    const info = await fs.readJson(RESTART_FILE);
    await fs.remove(RESTART_FILE);
    const elapsed = ((Date.now() - info.startedAt) / 1000).toFixed(1);
    await bot.sendMessage(
      info.chatId,
      `✅ Restart Complete!\n\n⏱ Time taken: \`${elapsed}s\``,
      { parse_mode: "Markdown" }
    );
  }
} catch (e) {
  logger.warn("Could not send restart notification: " + e.message);
};
