import axios from "axios";
import db from "../database/index.js";

const sessions = new Map();

export default {
  name: "quiz",
  alias: ["qz"],
  version: "1.1.0",
  author: "Azadx69x",
  role: 0,
  category: "game",

  execute: async function (client, message, args) {
    const chatId = message.chat.id;
    const userId = message.from.id;

    try {
      const response = await axios.get("https://azadx69x.is-a.dev/api/quiz", { timeout: 10000 });
      const q = response.data.data;

      const options = {
        A: q.options[0].slice(3),
        B: q.options[1].slice(3),
        C: q.options[2].slice(3),
        D: q.options[3].slice(3)
      };

      const questionText = `Q: ${q.question}\n\nA: ${options.A}\nB: ${options.B}\nC: ${options.C}\nD: ${options.D}\n\nReply with A, B, C or D.`;
      const sent = await client.sendMessage(chatId, questionText);

      sessions.set(sent.message_id, {
        userId,
        correct: q.answer.toUpperCase(),
        messageId: sent.message_id,
        chatId
      });

      setTimeout(() => {
        const s = sessions.get(sent.message_id);
        if (s) {
          client.sendMessage(chatId, `Time is up! The answer was: ${s.correct}`).catch(() => {});
          sessions.delete(sent.message_id);
        }
      }, 40000);
    } catch (err) {
      client.sendMessage(chatId, "Failed to fetch quiz. Try again later.");
    }
  },

  Reply: async function (client, message, replyToMessageId) {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const userReply = (message.text || "").trim().toUpperCase();

    if (!["A", "B", "C", "D"].includes(userReply)) return;

    const session = sessions.get(replyToMessageId);
    if (!session) return;
    if (session.userId !== userId) return;

    sessions.delete(replyToMessageId);

    const rewardCoins = 500;
    const rewardExp = 121;

    if (userReply === session.correct) {
      await db.users.addMoney(userId, rewardCoins);
      await db.users.addExp(userId, rewardExp);
      const totalMoney = await db.users.getMoney(userId);
      const totalExp = await db.users.getExp(userId);
      await client.sendMessage(chatId,
        `Correct! Answer: ${session.correct}\n+${rewardCoins} coins | +${rewardExp} exp\nTotal: ${totalMoney} coins | ${totalExp} exp`
      );
    } else {
      await client.sendMessage(chatId, `Wrong! The answer was: ${session.correct}`);
    }
  }
};
