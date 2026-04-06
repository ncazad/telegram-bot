import { readFileSync } from "fs"
import { isBanned, addUser } from "../utils/database.js"
import { checkAccess } from "../utils/roles.js"
import { loadLang, t } from "../utils/lang.js"
import { getCommand, getAllCommands } from "./commandLoader.js"
import logger from "../utils/logger.js"
import { isWhitelisted, isWLEnabled } from "../cmds/whitelist.js"

function getConfig() {
    return JSON.parse(readFileSync(new URL("../config.json", import.meta.url)))
}

function closestCommand(input) {
    const all = getAllCommands()
    const names = all.flatMap(c => [c.name, ...(c.alias || [])])
    let best = null, bestDist = Infinity
    for (const name of names) {
        const dist = levenshtein(input, name)
        if (dist < bestDist) { bestDist = dist; best = name }
    }
    return bestDist <= 3 ? best : null
}

function levenshtein(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) =>
        Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
    )
    for (let i = 1; i <= a.length; i++)
        for (let j = 1; j <= b.length; j++)
            dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]
                     : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[a.length][b.length]
}

async function dispatchOnChat(bot, msg) {
    const all = getAllCommands()
    for (const cmd of all) {
        if (typeof cmd.onChat === "function") {
            try { await cmd.onChat(bot, msg) } catch (e) {
                logger.error(`onChat [${cmd.name}]: ${e.message}`)
            }
        }
    }
}

async function dispatchReply(bot, msg) {
    const all = getAllCommands()
    const replyToId = msg.reply_to_message.message_id
    for (const cmd of all) {
        if (typeof cmd.Reply === "function") {
            try { await cmd.Reply(bot, msg, replyToId) } catch (e) {
                logger.error(`Reply [${cmd.name}]: ${e.message}`)
            }
        }
    }
}

function registerCommands(bot) {
    bot.on("message", async (msg) => {
        const rawText  = msg.text || ""
        const user     = msg.from
        const chatId   = msg.chat.id
        const chatType = msg.chat.type
        const config   = getConfig()
        const prefix   = config.bot?.prefix || ")"
        const lang     = loadLang(config.settings?.language || "en")

        if (!user) return

        if (await isBanned(user.id)) {
            if (rawText.startsWith(prefix)) {
                return bot.sendMessage(chatId, t(lang, "BANNED_MSG"))
            }
            return
        }

        if (rawText.startsWith(prefix)) {
            const wlEnabled = await isWLEnabled()
            if (wlEnabled) {
                const allowed = await checkAccess(bot, user.id, chatId, chatType, 2)
                const wled = await isWhitelisted(user.id)
                if (!allowed && !wled) {
                    return bot.sendMessage(chatId, "⛔ You are not whitelisted to use this bot.")
                }
            }
        }

        if (msg.new_chat_members?.length > 0) {
            await dispatchOnChat(bot, msg)
            return
        }

        if (msg.reply_to_message) {
            await dispatchReply(bot, msg)

            if (!rawText.startsWith(prefix)) {
                await dispatchOnChat(bot, msg)
                return
            }
        }

        if (rawText.trim().toLowerCase() === "prefix") {
            await addUser(user)
            const prefixCmd = getCommand("prefix")
            if (prefixCmd) {
                try { await prefixCmd.execute(bot, msg, []) } catch {}
            }
            return
        }

        if (!rawText.startsWith(prefix)) {
            await dispatchOnChat(bot, msg)
            return
        }

        await addUser(user)

        if (config.settings?.maintenance && !(await checkAccess(bot, user.id, chatId, chatType, 2))) {
            return bot.sendMessage(chatId, t(lang, "MAINTENANCE_MSG"))
        }

        const body = rawText.slice(prefix.length).trim()

        if (!body) {
            const name = msg.from?.first_name || "there"
            const text = t(lang, "PREFIX_ONLY", { NAME: name, PREFIX: prefix })
            bot.sendMessage(chatId, text)
            return
        }

        const parts   = body.split(" ")
        const cmdName = parts[0].split("@")[0].toLowerCase()
        const args    = parts.slice(1)

        const cmd = getCommand(cmdName)
        if (!cmd) {
            const suggestion = closestCommand(cmdName)
            if (suggestion) {
                bot.sendMessage(chatId, t(lang, "CMD_NOT_FOUND", { PREFIX: prefix, SUGGESTION: suggestion }))
            }
            return
        }

        const requiredRole = cmd.role ?? 0

        const allowed = await checkAccess(bot, user.id, chatId, chatType, requiredRole)
        if (!allowed) {
            const msgKey = requiredRole === 2 ? "ROLE_ADMIN_ONLY"
                         : requiredRole === 1 ? "ROLE_MOD_ONLY"
                         : "NO_PERMISSION"
            return bot.sendMessage(chatId, t(lang, msgKey), { parse_mode: "Markdown" })
        }

        try {
            logger.cmd(`${prefix}${cmdName} — @${user.username || user.first_name} (${user.id}) [role:${requiredRole}]`)
            await cmd.execute(bot, msg, args)
        } catch (err) {
            logger.error(`${prefix}${cmdName} → ${err.message}`)
            bot.sendMessage(chatId, t(lang, "ERROR_MSG"))
        }
    })

    bot.on("callback_query", async (query) => {
        const chatId   = query.message.chat.id
        const chatType = query.message.chat.type
        const data     = query.data
        bot.answerCallbackQuery(query.id)

        if (data === "help" || data === "info") {
            const fakeMsg = {
                chat: { id: chatId, type: chatType },
                from: query.from,
                text: `/${data}`
            }
            const cmd = getCommand(data)
            if (cmd) {
                try { await cmd.execute(bot, fakeMsg, []) } catch {}
            }
        }
    })
}

export { registerCommands }
