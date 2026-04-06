import db from "../database/index.js";

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

export default {
  name: "eval",
  alias: ["ev"],
  version: "1.1.0",
  author: "Azadx69x",
  role: 2,
  category: "owner",
  execute: async function (client, message, args) {
    const chatId = message.chat.id;
    const code = args.join(" ");
    if (!code) {
      return client.sendMessage(chatId, "No code provided.\n\nUsage: )eval <js code>\n\nAvailable: client, bot, message, msg, args, db");
    }
    try {
      const fn = new AsyncFunction("client", "bot", "message", "msg", "args", "db", code);
      const result = await fn(client, client, message, message, args, db);
      let reply;
      if (result === undefined || result === null) {
        reply = "Done. (no return value)";
      } else if (typeof result === "object") {
        reply = JSON.stringify(result, null, 2);
      } else {
        reply = String(result);
      }
      if (reply.length > 4000) reply = reply.slice(0, 4000) + "\n...(truncated)";
      return client.sendMessage(chatId, reply);
    } catch (err) {
      return client.sendMessage(chatId, "Error: " + err.message + "\n\nStack: " + (err.stack?.split("\n")[1] || ""));
    }
  }
};
