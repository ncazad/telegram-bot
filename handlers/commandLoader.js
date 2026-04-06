import { readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import logger from "../utils/logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CMDS_PATH  = join(__dirname, "../cmds");

const commands = new Map();
const aliases  = new Map();

const c = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
  green:   "\x1b[32m",
  bgreen:  "\x1b[92m",
  cyan:    "\x1b[36m",
  yellow:  "\x1b[33m",
  red:     "\x1b[31m",
  magenta: "\x1b[35m",
  blue:    "\x1b[34m",
  white:   "\x1b[97m",
  gray:    "\x1b[90m",
  black:   "\x1b[30m",
  bgGreen: "\x1b[42m",
  bgBlack: "\x1b[40m",
};

function getCategoryStyle() {
  return { icon: "◈", color: c.green };
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function dots(n = 20) {
  return (". ").repeat(n).trimEnd();
}

async function loadCommands() {
  const files = readdirSync(CMDS_PATH).filter(f => f.endsWith(".js"));
  const total  = files.length;
  let loaded = 0;
  let failed = 0;
  let index  = 0;

  const w = Math.min(process.stdout.columns || 80, 72);
  const line = "═".repeat(w);
  const thinLine = "─".repeat(w);

  console.log();
  console.log(`  ${c.green}╔${line}╗${c.reset}`);
  console.log(
    `  ${c.green}║${c.reset}` +
    `${c.bgreen}${c.bold}  COMMAND LOADER ${c.reset}` +
    `${c.gray}   [ ${total} FILES DETECTED ]${c.reset}`.padEnd(w - 35) +
    `${c.green}║${c.reset}`
  );
  console.log(`  ${c.green}╚${line}╝${c.reset}`);
  console.log();

  const categoryCount = {};

  for (const file of files) {
    const name = file.replace(".js", "");
    index++;
    const idx = String(index).padStart(2, "0");

    try {
      const filePath = pathToFileURL(join(CMDS_PATH, file)).href + `?t=${Date.now()}`;
      const mod = await import(filePath);
      const cmd = mod.default;

      if (!cmd?.name || !cmd?.execute) {
        console.log(
          `  ${c.gray}[${idx}]${c.reset} ${c.red}›${c.reset} ` +
          `${c.dim}${name.padEnd(14)}${c.reset}` +
          `${c.gray}${dots(14)}${c.reset}  ` +
          `${c.red}✖  [ MISSING name/execute ]${c.reset}`
        );
        failed++;
        continue;
      }

      commands.set(cmd.name.toLowerCase(), cmd);
      if (Array.isArray(cmd.alias)) {
        for (const alias of cmd.alias) {
          aliases.set(alias.toLowerCase(), cmd.name.toLowerCase());
        }
      }

      loaded++;
      const cat = (cmd.category || "general").toLowerCase();
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      const { icon, color } = getCategoryStyle(cat);
      const author = (cmd.author || "Unknown").padEnd(10);
      const cmdName = `/${cmd.name}`.padEnd(14);
      const catLabel = `[ ${cat} ]`.padEnd(12);

      console.log(
        `  ${c.gray}[${idx}]${c.reset} ${c.bgreen}›${c.reset} ` +
        `${c.bgreen}${c.bold}${cmdName}${c.reset}` +
        `${c.green}${dots(12)}${c.reset}  ` +
        `${c.bgreen}✔${c.reset}  ` +
        `${color}${icon} ${catLabel}${c.reset}  ` +
        `${c.gray}${author}${c.reset}`
      );

      await sleep(40);

    } catch (err) {
      console.log(
        `  ${c.gray}[${idx}]${c.reset} ${c.red}›${c.reset} ` +
        `${c.dim}${name.padEnd(14)}${c.reset}` +
        `${c.gray}${dots(14)}${c.reset}  ` +
        `${c.red}✖  [ ${err.message.slice(0, 35)} ]${c.reset}`
      );
      failed++;
    }
  }

  console.log();
  console.log(`  ${c.green}${thinLine}${c.reset}`);

  const cats = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, n]) => {
      return `${c.green}◈${cat}${c.gray}(${n})${c.reset}`;
    });

  console.log();
  console.log(
    `  ${c.bgreen}${c.bold}✔ LOADED: ${loaded}${c.reset}` +
    (failed ? `   ${c.red}✖ FAILED: ${failed}${c.reset}` : `   ${c.gray}✖ FAILED: 0${c.reset}`) +
    `   ${c.gray}│  ${cats.join("  ")}${c.reset}`
  );
  console.log();
  console.log(`  ${c.green}${thinLine}${c.reset}`);
  console.log();

  return commands;
}

async function loadSingleCommand(name) {
  const fileName = `${name.toLowerCase()}.js`;
  const filePath = join(CMDS_PATH, fileName);

  if (!existsSync(filePath)) return { ok: false, reason: "File not found" };

  try {
    const url = pathToFileURL(filePath).href + `?t=${Date.now()}`;
    const mod = await import(url);
    const cmd = mod.default;

    if (!cmd?.name || !cmd?.execute) return { ok: false, reason: "Missing name or execute" };

    const oldCmd = commands.get(cmd.name.toLowerCase());
    if (oldCmd?.alias) {
      for (const a of oldCmd.alias) aliases.delete(a.toLowerCase());
    }

    commands.set(cmd.name.toLowerCase(), cmd);
    if (Array.isArray(cmd.alias)) {
      for (const alias of cmd.alias) {
        aliases.set(alias.toLowerCase(), cmd.name.toLowerCase());
      }
    }

    return { ok: true, cmd };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

async function reloadAll() {
  commands.clear();
  aliases.clear();
  return await loadCommands();
}

function unloadCommand(name) {
  const key = name.toLowerCase();
  const cmd = commands.get(key);
  if (!cmd) return false;

  if (Array.isArray(cmd.alias)) {
    for (const a of cmd.alias) aliases.delete(a.toLowerCase());
  }
  commands.delete(key);
  return true;
}

function getCommand(name) {
  const key = name.toLowerCase();
  if (commands.has(key)) return commands.get(key);
  if (aliases.has(key))  return commands.get(aliases.get(key));
  return null;
}

function getAllCommands() {
  return [...commands.values()];
}

export { loadCommands, loadSingleCommand, reloadAll, unloadCommand, getCommand, getAllCommands };
