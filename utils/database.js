import usersDb from "../database/users.js"

async function addUser(user) {
    try {
        const existing = await usersDb.getUser(user.id)
        if (!existing) {
            await usersDb.setUser(user.id, {
                name: user.first_name + (user.last_name ? " " + user.last_name : ""),
                username: user.username || ""
            })
            return true
        }
        return false
    } catch { return false }
}

async function getUser(userId) {
    try {
        return await usersDb.getUser(userId)
    } catch { return null }
}

async function getAllUsers() {
    try {
        const all = await usersDb.getAll()
        return Object.values(all)
    } catch { return [] }
}

async function banUser(userId) {
    try {
        await usersDb.setUser(userId, { banned: true })
        return true
    } catch { return false }
}

async function unbanUser(userId) {
    try {
        await usersDb.setUser(userId, { banned: false })
        return true
    } catch { return false }
}

async function isBanned(userId) {
    try {
        const user = await usersDb.getUser(userId)
        return user?.banned || false
    } catch { return false }
}

async function getUserCount() {
    try {
        const all = await usersDb.getAll()
        return Object.keys(all).length
    } catch { return 0 }
}

export { addUser, getUser, getAllUsers, banUser, unbanUser, isBanned, getUserCount }
