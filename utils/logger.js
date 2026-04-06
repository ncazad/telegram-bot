const c = {
    reset:  "\x1b[0m",
    bold:   "\x1b[1m",
    green:  "\x1b[32m",
    cyan:   "\x1b[36m",
    yellow: "\x1b[33m",
    red:    "\x1b[31m",
    magenta:"\x1b[35m",
    white:  "\x1b[37m",
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const logger = {
    async banner(username, version, admins, madeBy) {
        console.clear();
        console.log(`${c.cyan}${c.bold}🤖 TELEGRAM BOT ${c.reset}\n`);
        await sleep(400);

        console.log(`${c.white}Initializing bot...${c.reset}`);
        await sleep(500);

        console.log(`${c.green}✔ Connecting to Telegram servers...${c.reset}`);
        await sleep(700);

        console.log(`${c.green}✔ Authenticating user...${c.reset}`);
        await sleep(700);

        console.log(`${c.cyan}✔ Login successful!${c.reset}\n`);
        await sleep(500);

        console.log(`${c.yellow}Bot Info:${c.reset}`);
        console.log(`  ${c.green}● Bot      : ${c.bold}@${username}${c.reset}`);
        console.log(`  ${c.green}● Version  : ${c.bold}v${version}${c.reset}`);
        console.log(`  ${c.green}● Admins   : ${c.bold}${admins.join(", ")}${c.reset}`);
        console.log(`  ${c.green}● Made by  : ${c.bold}${madeBy}${c.reset}`);
        console.log(`  ${c.green}● Mode     : ${c.bold}Polling${c.reset}\n`);
        console.log(`${c.cyan}🚀 Bot is now ONLINE!${c.reset}`);
    },

    info:    (msg) => console.log(`${c.cyan}[INFO]${c.reset}  ${msg}`),
    success: (msg) => console.log(`${c.green}[✔ OK]${c.reset}  ${msg}`),
    warn:    (msg) => console.log(`${c.yellow}[WARN]${c.reset}  ${msg}`),
    error:   (msg) => console.log(`${c.red}[ERR]${c.reset}  ${msg}`),
    cmd:     (msg) => console.log(`${c.magenta}[CMD]${c.reset}  ${msg}`),
    load:    (msg) => console.log(`${c.cyan}[LOAD]${c.reset}  ${msg}`),
};

export default logger;