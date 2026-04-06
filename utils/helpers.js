import { readFileSync } from "fs"

function getConfig() {
    return JSON.parse(readFileSync(new URL("../config.json", import.meta.url)))
}

function getMention(user) {
    if (user.username) return `@${user.username}`
    return `[${user.first_name}](tg://user?id=${user.id})`
}

function formatDate(date = new Date()) {
    return date.toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function escapeMarkdown(text) {
    return String(text).replace(/[_*`\[]/g, "\\$&")
}

export { getConfig, getMention, formatDate, sleep, escapeMarkdown }
