import gradient from "gradient-string";

const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  green:  "\x1b[32m",
  cyan:   "\x1b[36m",
  yellow: "\x1b[33m",
  white:  "\x1b[37m",
};

const ASCII = `
████████╗ ██████╗    ██████╗  ██████╗ ████████╗
╚══██╔══╝██╔════╝    ██╔══██╗██╔═══██╗╚══██╔══╝
   ██║   ██║  ███╗   ██████╦╝██║   ██║   ██║   
   ██║   ██║   ██║   ██╔══██╗██║   ██║   ██║   
   ██║   ╚██████╔╝   ██████╦╝╚██████╔╝   ██║   
   ╚═╝    ╚═════╝    ╚═════╝  ╚═════╝    ╚═╝   
`;

function centerText(text, rawLen) {
  const cols = process.stdout.columns || 100;
  const pad = Math.max(0, Math.floor((cols - rawLen) / 2));
  console.log(" ".repeat(pad) + text);
}

function createLine(char = "─", full = false) {
  const cols = process.stdout.columns || 100;
  const width = full ? cols : Math.min(cols, 60);
  return (char || "─").repeat(width);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function printBanner(username, version, admins, madeBy) {
  console.clear();

  console.log(gradient("#ff416c", "#ff4b2b")(createLine("─", true)));
  console.log();

  for (const line of ASCII.split("\n")) {
    const colored = gradient("#00b4db", "#0083b0")(line);
    const raw = line.replace(/\x1b\[[0-9;]*m/g, "");
    centerText(colored, raw.length);
  }

  console.log();

  const subTitle = `TG BOT @v${version}`;
  centerText(gradient("#9F98E8", "#AFF6CF")(subTitle), subTitle.length);

  const author = `Made by ${madeBy}`;
  centerText(gradient("#9F98E8", "#AFF6CF")(author), author.length);

  const srcUrl = "Source: https://github.com/ncazad/telegram-bot";
  centerText(gradient("#9F98E8", "#AFF6CF")(srcUrl), srcUrl.length);

  const fakeWarning = "ALL VERSIONS NOT RELEASED HERE ARE FAKE";
  centerText(gradient("#f5af19", "#f12711")(fakeWarning), fakeWarning.length);

  console.log();
  console.log(gradient("#ff416c", "#ff4b2b")(createLine("─", true)));
  console.log();

  await sleep(300);
  console.log(`${c.white}Initializing bot...${c.reset}`);
  await sleep(500);
  console.log(`${c.green}✔ Connecting to Telegram servers...${c.reset}`);
  await sleep(700);
  console.log(`${c.green}✔ Authenticating user...${c.reset}`);
  await sleep(700);
  console.log(`${c.cyan}✔ Login successful!${c.reset}\n`);
  await sleep(400);

  console.log(`${c.yellow}Bot Info:${c.reset}`);
  console.log(`  ${c.green}● Bot      : ${c.bold}@${username}${c.reset}`);
  console.log(`  ${c.green}● Version  : ${c.bold}v${version}${c.reset}`);
  console.log(`  ${c.green}● Admins   : ${c.bold}${admins.join(", ")}${c.reset}`);
  console.log(`  ${c.green}● Made by  : ${c.bold}${madeBy}${c.reset}`);
  console.log(`  ${c.green}● Mode     : ${c.bold}Polling${c.reset}\n`);

  console.log(gradient("#00b4db", "#0083b0")("🚀 Bot is now ONLINE!"));
  console.log();
}
