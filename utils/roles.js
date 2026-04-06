import { readFileSync, existsSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROLES_PATH = join(__dirname, "../data/roles.json")

/*
    0 = all users
    1 = Group admin
    2 = Bot admin
    3 = Bot owner
*/

const ROLE_LABELS = {
    owner: "👑 Owner",
    admin: "🛡️ Admin",
    mod:   "🔰 Moderator",
    user:  "👤 User"
}

const BOT_ROLE_LEVELS = {
    owner: 3,
    admin: 2,
    mod:   1,
    user:  0
}

function loadRoles() {
    if (!existsSync(ROLES_PATH)) {
        writeFileSync(ROLES_PATH, JSON.stringify({ roles: {} }, null, 2))
    }
    return JSON.parse(readFileSync(ROLES_PATH, "utf8"))
}

function saveRoles(data) {
    writeFileSync(ROLES_PATH, JSON.stringify(data, null, 2))
}

function getConfig() {
    return JSON.parse(readFileSync(new URL("../config.json", import.meta.url)))
}

function getUserRole(userId) {
    const config = getConfig()
    const id = Number(userId)
    if (id === Number(config.owner))        return "owner"
    if (config.admins.includes(id))         return "admin"
    const db = loadRoles()
    return db.roles[id] || "user"
}

function getBotRoleLevel(userId) {
    return BOT_ROLE_LEVELS[getUserRole(userId)] ?? 0
}

function getRoleLabel(userId) {
    return ROLE_LABELS[getUserRole(userId)] || "👤 User"
}

function isOwner(userId)  { return getUserRole(userId) === "owner" }
function isAdmin(userId)  { return getBotRoleLevel(userId) >= BOT_ROLE_LEVELS.admin }
function isMod(userId)    { return getBotRoleLevel(userId) >= BOT_ROLE_LEVELS.mod }

async function checkAccess(bot, userId, chatId, chatType, requiredRole) {
    const botLevel = getBotRoleLevel(userId)

    if (requiredRole === 0) return true

    if (requiredRole === 2) {
        return botLevel >= BOT_ROLE_LEVELS.admin
    }

    if (requiredRole === 1) {
        if (botLevel >= BOT_ROLE_LEVELS.admin) return true
        if (chatType !== "private") {
            try {
                const member = await bot.getChatMember(chatId, userId)
                return ["creator", "administrator"].includes(member.status)
            } catch {
                return false
            }
        }
        return false
    }

    return false
}

function setUserRole(userId, role) {
    if (!["mod", "user"].includes(role)) return false
    const db = loadRoles()
    if (role === "user") {
        delete db.roles[String(userId)]
    } else {
        db.roles[String(userId)] = role
    }
    saveRoles(db)
    return true
}

function hasRole(userId, required) {
    return getBotRoleLevel(userId) >= (BOT_ROLE_LEVELS[required] ?? 0)
}

export {
    getUserRole, getBotRoleLevel, getRoleLabel,
    isOwner, isAdmin, isMod,
    checkAccess, hasRole, setUserRole,
    ROLE_LABELS, BOT_ROLE_LEVELS
}
