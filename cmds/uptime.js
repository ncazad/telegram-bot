import os from "os";
import { execSync } from "child_process";

export default {
    name: "uptime",
    alias: ["up"],
    version: "0.0.7",
    author: "Azadx69x",
    role: 0,
    category: "system",
    description: "Advanced full system report",

    execute: async (client, message, args) => {
        const chatId = message.chat.id;
        const start = Date.now();

        const format = (sec) => {
            const d = Math.floor(sec / 86400);
            const h = Math.floor((sec % 86400) / 3600);
            const m = Math.floor((sec % 3600) / 60);
            const s = Math.floor(sec % 60);
            return `${d}d ${h}h ${m}m ${s}s`;
        };

        const botUptime = format(process.uptime());
        const sysUptime = format(os.uptime());

        const cpus = os.cpus();
        const cpuModel = cpus[0].model.trim();
        const cpuCores = cpus.length;
        const cpuSpeed = cpus[0].speed;

        const load = os.loadavg().map(v => v.toFixed(2));

        const toGB = (b) => (b / 1024 / 1024 / 1024).toFixed(2);
        const toMB = (b) => (b / 1024 / 1024).toFixed(0);

        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

        const mem = process.memoryUsage();
        const heapPercent = ((mem.heapUsed / mem.heapTotal) * 100).toFixed(1);

        const platform = os.platform();
        const arch = os.arch();
        const release = os.release();
        const hostname = os.hostname();
        const user = os.userInfo().username;

        let ip = "127.0.0.1";
        const nets = os.networkInterfaces();
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                if (net.family === "IPv4" && !net.internal) {
                    ip = net.address;
                    break;
                }
            }
            if (ip !== "127.0.0.1") break;
        }

        let diskInfo = { total: "N/A", used: "N/A", free: "N/A", percent: "N/A" };
        try {
            const stdout = execSync("df -h / | tail -1", { encoding: "utf8" });
            const parts = stdout.trim().split(/\s+/);
            if (parts.length >= 6) {
                diskInfo.total = parts[1];
                diskInfo.used = parts[2];
                diskInfo.free = parts[3];
                diskInfo.percent = parts[4];
            }
        } catch {}

        const nodeVersion = process.version;
        const pid = process.pid;
        const cwd = process.cwd();
        const latency = Date.now() - start;

        const msg =
`⏱️ UPTIME
├─ Bot: ${botUptime}
├─ System: ${sysUptime}
└─ Response: ${latency}ms

🖥️ SYSTEM
├─ OS: ${platform} ${arch}
├─ Release: ${release}
├─ Host: ${hostname}
├─ User: ${user}
└─ IP: ${ip}

⚙️ CPU
├─ ${cpuModel}
├─ Cores: ${cpuCores} @ ${cpuSpeed}MHz
└─ Load: [${load[0]}] [${load[1]}] [${load[2]}]

💾 MEMORY
├─ Total: ${toGB(totalMem)} GB
├─ Used:  ${toGB(usedMem)} GB (${memPercent}%)
└─ Free:  ${toGB(freeMem)} GB

🧠 PROCESS
├─ RSS: ${toMB(mem.rss)} MB
├─ Heap: ${toMB(mem.heapUsed)}/${toMB(mem.heapTotal)} MB (${heapPercent}%)
└─ External: ${toMB(mem.external)} MB

💿 STORAGE
├─ Total: ${diskInfo.total}
├─ Used:  ${diskInfo.used} (${diskInfo.percent})
└─ Free:  ${diskInfo.free}

🔧 RUNTIME
├─ Node: ${nodeVersion}
├─ PID: ${pid}
└─ Path: ${cwd}`;

        await client.sendMessage(chatId, msg);
    }
};
