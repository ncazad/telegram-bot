# Telegram Bot - Made by Azadx69x

## Project Overview

Telegram bot (@x69xbot_bot) built in Node.js 20 with ES Modules. Uses node-telegram-bot-api in polling mode, MongoDB for persistence, bold math unicode font on all outgoing messages, prefix `)`, owner ID: 7047432575.

## Project Structure

```
├── index.js                  # Entry point: sets up bot, patches methods, starts polling
├── config.json               # Non-sensitive config (username, admins, credits)
├── package.json              # type: "module" - ES Module project
├── cmds/                     # Auto-loaded command files
│   ├── album.js              # Album video browser with Reply handler
│   ├── eval.js               # Owner JS eval (client, bot, message, msg, args, db)
│   ├── pfp.js                # Profile photo fetcher
│   ├── quiz.js               # Quiz game with MongoDB reward persistence
│   ├── sing.js               # Music download
│   └── ...                   # Other commands
├── handlers/
│   ├── commandLoader.js      # Auto-loads all cmds/*.js
│   ├── commands.js           # Dispatcher: execute/Reply/onChat/new_chat_members
│   ├── admin.js              # Admin commands
│   └── autodownload.js       # Auto-download handler
├── utils/
│   ├── font.js               # bf() + applyBoldFont() — bold math unicode
│   ├── helpers.js            # isAdmin(), isOwner(), etc.
│   ├── logger.js             # Logging utility
│   ├── safeSend.js           # Safe message sender
│   └── roles.js              # Role management
├── database/
│   ├── mongodb.js            # Connection + model definitions (UserModel, ThreadModel, GlobalModel)
│   ├── users.js              # User CRUD: addMoney, getMoney, addExp, getExp, ban, etc.
│   ├── global.js             # Global key-value store
│   ├── threads.js            # Per-group settings + data
│   └── index.js              # Exports { users, global, threads }
└── languages/
    └── en.lang               # Message strings
```

## Environment Variables / Secrets

All sensitive credentials are stored as Replit Secrets (never in code files):

- `BOT_TOKEN` — Telegram bot token from BotFather
- `MONGODB_URI` — MongoDB connection string

## Key Architecture Notes

### Font System
`utils/font.js` exports `bf()` (convert to bold math unicode) and `applyBoldFont()` (skips URLs).
Applied globally via `patchBotFont()` in index.js wrapping `sendMessage`, `editMessageText`, `sendPhoto`, `sendAudio`, `sendVideo`, `sendDocument`. Commands do NOT need to call it manually.

### Bot Extra Methods (index.js `patchBotExtras`)
- `client.setMessageReaction(chatId, messageId, emoji, isBig)` — calls Telegram 7.0 API endpoint

### Database Pattern
Commands import: `import db from "../database/index.js"`
Then use: `db.users.addMoney(userId, amount)`, `db.users.getExp(userId)`, `db.threads.getThread(chatId)`, `db.global.get(key)`, etc.

MongoDB models use unique names to avoid conflicts: `BotUser`, `BotThread`, `BotGlobal`.

### Command Reply/Chat Handlers
- `Reply` — called when user replies to a specific bot message (album, quiz number selection)
- `onChat` — called for all non-command messages (bby trigger)
- `new_chat_members` — fires when someone joins (auto-welcome)

### Polling & 409 Handling
Polling: interval=1000ms, timeout=10s, autoStart=false.
On 409 conflict: stop → clearWebhook → wait 20s → restart.

## Adding New Commands

```js
import db from "../database/index.js";

export default {
  name: "mycommand",
  alias: ["mc"],
  version: "1.0.0",
  author: "Azadx69x",
  role: 0,           // 0=all, 1=admin, 2=owner
  category: "utility",
  execute: async (client, message, args) => {
    const chatId = message.chat.id;
    await client.sendMessage(chatId, "Hello!");
  },
  Reply: async (client, message, replyToMessageId) => {
    // optional: fires when user replies to a bot message from this command
  },
  onChat: async (client, message) => {
    // optional: fires on every non-command message
  }
};
```

## Tech Stack

- Node.js 20 (ES Modules)
- node-telegram-bot-api (polling mode)
- mongoose (MongoDB ODM)
- axios, canvas, fs-extra
- System deps: libuuid, cairo, pango, libjpeg, giflib, pkg-config
