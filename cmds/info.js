import { getUser, addUser } from "../utils/database.js";
import { getRoleLabel } from "../utils/roles.js";

export default {
    name: "info",
    alias: ["me", "whoami"],
    version: "1.0.0",
    author: "Azadx69x",
    role: 0,
    category: "info",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;
        const user = message.from;

        addUser(user);
        const dbUser = getUser(user.id);

        const name     = [user.first_name, user.last_name].filter(Boolean).join(" ");
        const username = user.username ? `@${user.username}` : "—";
        const joined   = dbUser?.joined ? dbUser.joined.split("T")[0] : "N/A";
        const role     = getRoleLabel(user.id);
        const chatType = message.chat.type;

        const text =
`┍━━━[ 👤 YOUR PROFILE ]━━━◊
┋🆔 ID       : \`${user.id}\`
┋📛 Name     : ${name}
┋🔗 Username : ${username}
┋💬 Chat     : ${chatType}
┋📅 Joined   : ${joined}
┋🎖️ Role     : ${role}
┕━━━━━━━━━━━━━━━━◊`;

        await client.sendMessage(chatId, text, { parse_mode: "Markdown" });
    }
};
