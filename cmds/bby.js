import axios from "axios";

const baseApiUrl = async () => {
  return "https://baby-apisx.vercel.app";
};

export default {
  name: "bby",
  alias: ["baby"],
  version: "1.0.0",
  author: "Aryan",
  role: 0,
  category: "chat",

  execute: async (client, message, args) => {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const fullText = (message.text || "").trim();
    const lowerText = fullText.toLowerCase();

    if (!args.length) {
      const greetings = ["Bolo baby", "hum"];
      const randomGreet = greetings[Math.floor(Math.random() * greetings.length)];
      return client.sendMessage(chatId, randomGreet);
    }

    const command = args[0].toLowerCase();
    const rest = args.slice(1).join(" ");

    const callApi = async (params) => {
      const link = `${await baseApiUrl()}/baby`;
      const response = await axios.get(link, { params, timeout: 15000 });
      return response.data;
    };

    if (command === "remove" || command === "rm") {
      if (!rest) return client.sendMessage(chatId, "❌ Format: remove [message] OR rm [message] - [index]");
      if (rest.includes("-")) {
        const [msg, idx] = rest.split(/\s*-\s*/);
        const data = await callApi({ remove: msg.trim(), index: idx.trim(), senderID: userId });
        return client.sendMessage(chatId, data.message);
      } else {
        const data = await callApi({ remove: rest, senderID: userId });
        return client.sendMessage(chatId, data.message);
      }
    }

    if (command === "list") {
      if (args[1] === "all") {
        const limit = parseInt(args[2]) || 100;
        const data = await callApi({ list: "all" });
        const teacherList = data?.teacher?.teacherList || [];
        const limited = teacherList.slice(0, limit);
        let output = `Total Teach = ${data.length || teacherList.length}\n👑 List of Teachers:\n`;
        for (let i = 0; i < limited.length; i++) {
          const uid = Object.keys(limited[i])[0];
          const value = limited[i][uid];
          let name = uid;
          try {
            const chat = await client.getChat(chatId);
            const member = await chat.getMember(parseInt(uid));
            name = member.user.first_name || uid;
          } catch(e) {}
          output += `${i+1}. ${name}: ${value}\n`;
        }
        return client.sendMessage(chatId, output);
      } else {
        const data = await callApi({ list: "all" });
        return client.sendMessage(chatId, `❇️ Total Teach = ${data.length || "api off"}\n♻️ Total Response = ${data.responseLength || "api off"}`);
      }
    }

    if (command === "msg") {
      if (!rest) return client.sendMessage(chatId, "❌ Usage: msg [message]");
      const data = await callApi({ list: rest });
      const replyText = data.data ? `Message ${rest} = ${data.data}` : "Not found";
      return client.sendMessage(chatId, replyText);
    }

    if (command === "edit") {
      const match = fullText.match(/edit\s+(.+?)\s*-\s*(.+)/i);
      if (!match) return client.sendMessage(chatId, "❌ Format: edit [YourMessage] - [NewReply]");
      const editKey = match[1].trim();
      const newReply = match[2].trim();
      const data = await callApi({ edit: editKey, replace: newReply, senderID: userId });
      return client.sendMessage(chatId, data.message);
    }

    if (command === "teach") {
      const match = fullText.match(/teach(?:\s+(react|amar))?\s+(.+?)\s*-\s*(.+)/i);
      if (!match) return client.sendMessage(chatId, "❌ Format: teach [YourMessage] - [Reply]");
      const type = match[1] ? match[1].toLowerCase() : null;
      const msg = match[2].trim();
      const reply = match[3].trim();
      if (type === "amar") {
        const data = await callApi({ teach: msg, reply: reply, senderID: userId, key: "intro" });
        return client.sendMessage(chatId, `✅ Replies added ${data.message}`);
      } else if (type === "react") {
        const data = await callApi({ teach: msg, react: reply });
        return client.sendMessage(chatId, `✅ Replies added ${data.message}`);
      } else {
        const data = await callApi({ teach: msg, reply: reply, senderID: userId, threadID: chatId });
        let teacherName = "Unknown";
        try {
          const chat = await client.getChat(chatId);
          const member = await chat.getMember(userId);
          teacherName = member.user.first_name || userId;
        } catch(e) {}
        return client.sendMessage(chatId, `✅ Replies added ${data.message}\nTeacher: ${teacherName}\nTeachs: ${data.teachs}`);
      }
    }

    if (lowerText.includes("amar name ki") || lowerText.includes("amr nam ki") || lowerText.includes("amar nam ki") || lowerText.includes("amr name ki") || lowerText.includes("whats my name")) {
      const data = await callApi({ text: "amar name ki", senderID: userId, key: "intro" });
      return client.sendMessage(chatId, data.reply);
    }

    try {
      const data = await callApi({ text: rest || fullText, senderID: userId, font: 1 });
      return client.sendMessage(chatId, data.reply || "No reply");
    } catch (err) {
      console.error("Baby API error:", err.message);
      return client.sendMessage(chatId, "❌ API error, try again later.");
    }
  },

  onChat: async (client, message) => {
    const text = message.text?.toLowerCase() || "";
    if (text === "bby" || text === "baby" || text.startsWith("bby ") || text.startsWith("baby ")) {
      const chatId = message.chat.id;
      const userId = message.from.id;
      const callApi = async (params) => {
        const link = `${await baseApiUrl()}/baby`;
        const response = await axios.get(link, { params, timeout: 15000 });
        return response.data;
      };
      try {
        const query = text.replace(/^(bby|baby)\s*/i, "").trim();
        if (!query) {
          const greetings = ["Bolo baby", "hum"];
          const randomGreet = greetings[Math.floor(Math.random() * greetings.length)];
          return client.sendMessage(chatId, randomGreet);
        }
        const data = await callApi({ text: query, senderID: userId, font: 1 });
        return client.sendMessage(chatId, data.reply || "No reply");
      } catch (err) {
        console.error("Auto-reply error:", err.message);
        return client.sendMessage(chatId, "❌ Error processing message.");
      }
    }
  }
};
