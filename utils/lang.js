import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadLang(code = "en") {
    const file = join(__dirname, `../languages/${code}.lang`)
    const lines = readFileSync(file, "utf8").split("\n")
    const lang  = {}

    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) continue
        const eq  = trimmed.indexOf("=")
        if (eq === -1) continue
        const key = trimmed.slice(0, eq).trim()
        const val = trimmed.slice(eq + 1).trim().replace(/\\n/g, "\n")
        lang[key] = val
    }
    return lang
}

function t(lang, key, vars = {}) {
    let str = lang[key] || key
    for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, v)
    }
    return str
}

export { loadLang, t }
