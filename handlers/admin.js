import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getConfig() {
    return JSON.parse(readFileSync(new URL("../config.json", import.meta.url)));
}

function saveConfig(config) {
    writeFileSync(join(__dirname, "../config.json"), JSON.stringify(config, null, 2));
}

function registerAdminCommands(bot) {
}

export { registerAdminCommands, getConfig, saveConfig };
