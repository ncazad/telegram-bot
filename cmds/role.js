import { loadLang, t } from "../utils/lang.js"
import { readFileSync } from "fs"
import { getUserRole, setUserRole, getRoleLabel, hasRole } from "../utils/roles.js"
import { getUser } from "../utils/database.js"

export default {
    name: "role",
    alias: ["setrole", "mod", "demod"],
    version: "1.0.0",
    author: "Azadx69x",
    category: "admin",
    role: 2,

    execute: async (client, message, args) => {
        const chatId  = message.chat.id
        const user    = message.from
        const config  = JSON.parse(readFileSync(new URL("../config.json", import.meta.url)))
        const lang    = loadLang(config.settings?.language || "en")

        const subCmd  = args[0]?.toLowerCase()
        const targetId = args[1] ? parseInt(args[1]) : null

        if (!subCmd || (subCmd !== "set" && subCmd !== "remove" && subCmd !== "view")) {
            const text =
                `🎖️ *Role Manager*\n` +
                `${"─".repeat(25)}\n\n` +
                `📌 *Commands:*\n` +
                `• \`/role view [id]\` — View user role\n` +
                `• \`/role set [id] mod\` — Make moderator\n` +
                `• \`/role remove [id]\` — Remove mod role\n\n` +
                `🏷️ *Role Levels:*\n` +
                `• 👑 Owner — full access\n` +
                `• 🛡️ Admin — set in config.json\n` +
                `• 🔰 Mod — set via this command\n` +
                `• 👤 User — default\n\n` +
                `✨ _Made by Azadx69x_`
            return client.sendMessage(chatId, text, { parse_mode: "Markdown" })
        }

        if (subCmd === "view") {
            const id = targetId || user.id
            const dbUser = getUser(id)
            const name = dbUser ? `${dbUser.first_name} ${dbUser.last_name || ""}`.trim() : `ID: ${id}`
            const role = getRoleLabel(id)

            const text = t(lang, "ROLE_VIEW", {
                ID:   id,
                NAME: name,
                ROLE: role
            })
            return client.sendMessage(chatId, text, { parse_mode: "Markdown" })
        }

        if (!hasRole(user.id, "admin")) {
            return client.sendMessage(chatId, t(lang, "ROLE_ADMIN_ONLY"), { parse_mode: "Markdown" })
        }

        if (!targetId) {
            return client.sendMessage(chatId, t(lang, "ROLE_NO_TARGET", { CMD: "role set" }), { parse_mode: "Markdown" })
        }

        if (targetId === user.id) {
            return client.sendMessage(chatId, t(lang, "ROLE_SELF"), { parse_mode: "Markdown" })
        }

        const targetCurrentRole = getUserRole(targetId)
        if (targetCurrentRole === "owner" || targetCurrentRole === "admin") {
            return client.sendMessage(chatId, `❌ Cannot modify role of *${targetCurrentRole}*.`, { parse_mode: "Markdown" })
        }

        if (subCmd === "set") {
            const newRole = args[2]?.toLowerCase()
            if (!["mod"].includes(newRole)) {
                return client.sendMessage(chatId, t(lang, "ROLE_INVALID"), { parse_mode: "Markdown" })
            }

            setUserRole(targetId, newRole)
            return client.sendMessage(chatId,
                t(lang, "ROLE_SET_SUCCESS", { ROLE: newRole.toUpperCase(), ID: targetId }),
                { parse_mode: "Markdown" }
            )
        }

        if (subCmd === "remove") {
            setUserRole(targetId, "user")
            return client.sendMessage(chatId,
                t(lang, "ROLE_REMOVE_SUCCESS", { ID: targetId }),
                { parse_mode: "Markdown" }
            )
        }
    }
}
