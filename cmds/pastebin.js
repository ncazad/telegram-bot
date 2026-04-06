import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  name: "pastebin",
  alias: ["past"],
  version: "1.0.0",
  author: "Azadx69x",
  role: 0,
  category: "utility",
  execute: async (client, message, args) => {
    const chatId = message.chat.id;
    const fileName = args[0];
    if (!fileName) return client.sendMessage(chatId, "❌ No file name.");

    const cmdsFolder = __dirname;
    const possibleFiles = [
      path.join(cmdsFolder, fileName),
      path.join(cmdsFolder, fileName + ".js"),
      path.join(cmdsFolder, fileName + ".txt")
    ];

    let filePath = null;
    for (const f of possibleFiles) {
      if (fs.existsSync(f)) {
        filePath = f;
        break;
      }
    }
    if (!filePath) return client.sendMessage(chatId, "❌ File not found.");

    try {
      const data = fs.readFileSync(filePath, "utf8");
      const apiURL = "https://azadx69x.is-a.dev/api/pastebin";
      const response = await axios.get(apiURL, { params: { query: data }, timeout: 20000 });
      const result = response.data;
      if (!result || !result.success) return client.sendMessage(chatId, "❌ Upload failed.");
      return client.sendMessage(chatId, result.result.raw_url);
    } catch {
      return client.sendMessage(chatId, "❌ Error.");
    }
  }
};
