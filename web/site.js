import { getAllCommands } from "../handlers/commandLoader.js";

const startTime = Date.now();

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sc}s`;
  if (m > 0) return `${m}m ${sc}s`;
  return `${sc}s`;
}

export function setupWebsite(app, bot, config) {

  app.get("/api/info", async (req, res) => {
    try {
      const me = await bot.getMe();
      const cmds = getAllCommands();
      const uptimeMs = Date.now() - startTime;

      const categories = {};
      for (const cmd of cmds) {
        const cat = cmd.category || "general";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd.name);
      }

      res.json({
        online: true,
        name: me.first_name,
        username: me.username,
        id: me.id,
        version: config.credits?.version || "2.0.0",
        madeBy: config.credits?.made_by || "Azadx69x",
        prefix: config.bot?.prefix || ")",
        mode: "Polling",
        uptime: formatUptime(uptimeMs),
        uptimeMs,
        commandCount: cmds.length,
        categories,
        admins: config.admins || [],
        language: config.settings?.language || "en",
        maintenance: config.settings?.maintenance || false,
      });
    } catch (err) {
      res.status(500).json({ online: false, error: err.message });
    }
  });

  app.get("/", (req, res) => {
    res.send(renderHTML(config));
  });
}

function renderHTML(config) {
  const botUsername = config?.bot?.username || "bot";
  const madeBy = config?.credits?.made_by || "Azadx69x";
  const version = config?.credits?.version || "2.0.0";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${botUsername} — Bot Status</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --green: #00ff88;
      --green2: #00cc66;
      --dark: #0a0f1a;
      --card: #0d1526;
      --border: #0f2d1f;
      --gray: #4a6373;
      --white: #e0ffe8;
      --red: #ff4466;
    }

    body {
      background: var(--dark);
      color: var(--white);
      font-family: 'Share Tech Mono', monospace;
      min-height: 100vh;
      overflow-x: hidden;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,255,136,0.015) 2px,
        rgba(0,255,136,0.015) 4px
      );
      pointer-events: none;
      z-index: 0;
    }

    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 40px 20px;
      position: relative;
      z-index: 1;
    }

    /* ── HEADER ── */
    .header {
      text-align: center;
      margin-bottom: 48px;
      animation: fadeIn 0.8s ease;
    }

    .bot-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 3px solid var(--green);
      box-shadow: 0 0 30px rgba(0,255,136,0.4);
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      background: var(--card);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 20px rgba(0,255,136,0.4); }
      50%       { box-shadow: 0 0 40px rgba(0,255,136,0.8); }
    }

    .bot-name {
      font-family: 'Orbitron', monospace;
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--green);
      text-shadow: 0 0 20px rgba(0,255,136,0.6);
      letter-spacing: 2px;
    }

    .bot-username {
      color: var(--gray);
      font-size: 1rem;
      margin-top: 6px;
      letter-spacing: 1px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0,255,136,0.1);
      border: 1px solid var(--green2);
      border-radius: 999px;
      padding: 6px 18px;
      font-size: 0.85rem;
      color: var(--green);
      margin-top: 14px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--green);
      animation: blink 1.2s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }

    /* ── STAT CARDS ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
      animation: fadeIn 1s ease 0.2s both;
    }

    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: border-color 0.3s, transform 0.2s;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(0,255,136,0.04) 0%, transparent 60%);
    }

    .stat-card:hover {
      border-color: var(--green2);
      transform: translateY(-3px);
    }

    .stat-label {
      font-size: 0.7rem;
      color: var(--gray);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .stat-value {
      font-family: 'Orbitron', monospace;
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--green);
    }

    /* ── INFO SECTION ── */
    .section {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
      margin-bottom: 24px;
      animation: fadeIn 1s ease 0.4s both;
    }

    .section-title {
      font-family: 'Orbitron', monospace;
      font-size: 0.75rem;
      letter-spacing: 3px;
      color: var(--green2);
      text-transform: uppercase;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(15,45,31,0.5);
    }

    .info-row:last-child { border-bottom: none; }

    .info-key {
      color: var(--gray);
      font-size: 0.85rem;
      letter-spacing: 1px;
    }

    .info-val {
      color: var(--white);
      font-size: 0.9rem;
    }

    .info-val.green { color: var(--green); }
    .info-val.red   { color: var(--red); }

    /* ── CATEGORY GRID ── */
    .cat-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
    }

    .cat-tag {
      background: rgba(0,255,136,0.08);
      border: 1px solid rgba(0,255,136,0.2);
      border-radius: 6px;
      padding: 5px 14px;
      font-size: 0.78rem;
      color: var(--green2);
      cursor: default;
      transition: background 0.2s;
    }

    .cat-tag:hover { background: rgba(0,255,136,0.15); }

    /* ── FOOTER ── */
    .footer {
      text-align: center;
      padding-top: 32px;
      color: var(--gray);
      font-size: 0.78rem;
      letter-spacing: 1px;
      animation: fadeIn 1s ease 0.6s both;
    }

    .footer a {
      color: var(--green2);
      text-decoration: none;
    }

    .footer a:hover { text-decoration: underline; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .loading { color: var(--gray); font-size: 0.85rem; }
    .error   { color: var(--red);  font-size: 0.85rem; }

    #uptime-counter { font-family: 'Orbitron', monospace; font-size: 1.4rem; font-weight: 700; color: var(--green); }
  </style>
</head>
<body>
  <div class="container">

    <!-- HEADER -->
    <div class="header">
      <div class="bot-avatar">🤖</div>
      <div class="bot-name" id="bot-name">@${botUsername}</div>
      <div class="bot-username" id="bot-username">Loading...</div>
      <div class="status-badge">
        <div class="status-dot"></div>
        <span>ONLINE</span>
      </div>
    </div>

    <!-- STAT CARDS -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Version</div>
        <div class="stat-value" id="stat-version">${version}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Commands</div>
        <div class="stat-value" id="stat-cmds">—</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Mode</div>
        <div class="stat-value" id="stat-mode">—</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Uptime</div>
        <div id="uptime-counter">—</div>
      </div>
    </div>

    <!-- BOT INFO -->
    <div class="section">
      <div class="section-title">◈ Bot Info</div>
      <div class="info-row">
        <span class="info-key">Name</span>
        <span class="info-val green" id="info-name">—</span>
      </div>
      <div class="info-row">
        <span class="info-key">Username</span>
        <span class="info-val" id="info-username">—</span>
      </div>
      <div class="info-row">
        <span class="info-key">Bot ID</span>
        <span class="info-val" id="info-id">—</span>
      </div>
      <div class="info-row">
        <span class="info-key">Prefix</span>
        <span class="info-val green" id="info-prefix">—</span>
      </div>
      <div class="info-row">
        <span class="info-key">Language</span>
        <span class="info-val" id="info-lang">—</span>
      </div>
      <div class="info-row">
        <span class="info-key">Maintenance</span>
        <span class="info-val" id="info-maint">—</span>
      </div>
    </div>

    <!-- CREATOR INFO -->
    <div class="section">
      <div class="section-title">◈ Creator</div>
      <div class="info-row">
        <span class="info-key">Made By</span>
        <span class="info-val green" id="info-creator">${madeBy}</span>
      </div>
      <div class="info-row">
        <span class="info-key">GitHub</span>
        <span class="info-val">
          <a href="https://github.com/ncazad" target="_blank" style="color:#00ff88;text-decoration:none;">github.com/ncazad</a>
        </span>
      </div>
      <div class="info-row">
        <span class="info-key">Telegram</span>
        <span class="info-val">
          <a href="https://t.me/${botUsername}" target="_blank" style="color:#00ff88;text-decoration:none;">@${botUsername}</a>
        </span>
      </div>
      <div class="info-row">
        <span class="info-key">Admins</span>
        <span class="info-val" id="info-admins">—</span>
      </div>
    </div>

    <!-- CATEGORIES -->
    <div class="section">
      <div class="section-title">◈ Command Categories</div>
      <div class="cat-grid" id="cat-grid">
        <span class="loading">Loading categories...</span>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p>© ${madeBy} ·</p>
      <p style="margin-top:6px;">
        <a href="https://t.me/${botUsername}" target="_blank">Telegram</a>
        &nbsp;·&nbsp;
        <a href="https://github.com/ncazad/telegram-bot" target="_blank">GitHub</a>
      </p>
    </div>

  </div>

  <script>
    let uptimeMs = 0;
    let uptimeInterval = null;

    async function fetchInfo() {
      try {
        const res = await fetch('/api/info');
        const d = await res.json();
        if (!d.online) throw new Error(d.error);

        document.getElementById('bot-name').textContent = d.name;
        document.getElementById('bot-username').textContent = '@' + d.username + ' · ID: ' + d.id;

        document.getElementById('stat-version').textContent = 'v' + d.version;
        document.getElementById('stat-cmds').textContent = d.commandCount;
        document.getElementById('stat-mode').textContent = d.mode;

        document.getElementById('info-name').textContent = d.name;
        document.getElementById('info-username').textContent = '@' + d.username;
        document.getElementById('info-id').textContent = d.id;
        document.getElementById('info-prefix').textContent = d.prefix;
        document.getElementById('info-lang').textContent = d.language.toUpperCase();

        const maintEl = document.getElementById('info-maint');
        maintEl.textContent = d.maintenance ? 'ON' : 'OFF';
        maintEl.className = 'info-val ' + (d.maintenance ? 'red' : 'green');

        document.getElementById('info-creator').textContent = d.madeBy;
        document.getElementById('info-admins').textContent = d.admins.join(', ') || 'None';

        const catGrid = document.getElementById('cat-grid');
        catGrid.innerHTML = '';
        for (const [cat, cmds] of Object.entries(d.categories)) {
          const tag = document.createElement('span');
          tag.className = 'cat-tag';
          tag.title = cmds.join(', ');
          tag.textContent = cat + ' (' + cmds.length + ')';
          catGrid.appendChild(tag);
        }

        uptimeMs = d.uptimeMs;
        if (!uptimeInterval) {
          uptimeInterval = setInterval(() => {
            uptimeMs += 1000;
            document.getElementById('uptime-counter').textContent = formatUptime(uptimeMs);
          }, 1000);
        }
        document.getElementById('uptime-counter').textContent = d.uptime;

      } catch (err) {
        document.getElementById('uptime-counter').textContent = 'ERR';
        console.error('Failed to fetch bot info:', err);
      }
    }

    function formatUptime(ms) {
      const s = Math.floor(ms / 1000);
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sc = s % 60;
      if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
      if (h > 0) return h + 'h ' + m + 'm ' + sc + 's';
      if (m > 0) return m + 'm ' + sc + 's';
      return sc + 's';
    }

    fetchInfo();
    setInterval(fetchInfo, 30000);
  </script>
</body>
</html>`;
}
