import axios from "axios";

export default {
  name: "font",
  alias: ["fonts"],
  version: "1.0.0",
  author: "Azadx69x",
  role: 0,
  category: "utility",
  execute: async (client, message, args) => {
    const chatId = message.chat.id;

    if (args.length === 0) {
      return client.sendMessage(chatId, "Usage: font list\n       font <1-30> <text>");
    }

    const firstArg = args[0].toLowerCase();

    if (firstArg === "list" || firstArg === "all") {
      return showFontList(client, chatId);
    }

    const styleNum = parseInt(firstArg);
    if (!isNaN(styleNum)) {
      if (styleNum < 1 || styleNum > 30) {
        return client.sendMessage(chatId, "❌ Invalid style! Choose 1-30");
      }
      const text = args.slice(1).join(" ");
      if (text.length === 0) {
        return client.sendMessage(chatId, "Usage: font " + styleNum + " <your text>");
      }
      return convertFont(client, chatId, styleNum, text);
    }

    return client.sendMessage(chatId, "Usage: font list\n       font <1-30> <text>");
  }
};

async function convertFont(client, chatId, styleNum, text) {
  try {
    const url = "https://azadx69x.is-a.dev/api/font";
    const response = await axios.get(url, { params: { text: text, style: styleNum }, timeout: 15000 });
    const output = response.data && response.data.output;
    if (output) {
      return client.sendMessage(chatId, output);
    } else {
      throw new Error("No output");
    }
  } catch (err) {
    console.error("Font conversion error:", err.message);
    return client.sendMessage(chatId, "❌ Failed to generate font.");
  }
}

async function showFontList(client, chatId) {
  const previewText = "Azadx69x";
  let message = "All Font Styles (1-30)\n\n";

  for (let i = 1; i <= 30; i++) {
    try {
      const url = "https://azadx69x.is-a.dev/api/font";
      const response = await axios.get(url, { params: { text: previewText, style: i }, timeout: 3000 });
      const preview = (response.data && response.data.output) || previewText;
      const num = (i < 10 ? "0" : "") + i;
      message = message + num + ". " + preview + "\n";
    } catch (err) {
      const num = (i < 10 ? "0" : "") + i;
      message = message + num + ". ⚠️ Error\n";
    }
  }

  message = message + "\nUse: font <1-30> <text> to convert.";
  await client.sendMessage(chatId, message);
}
