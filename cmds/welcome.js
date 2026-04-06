import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

async function getCanvas() {
  return await import("canvas");
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const backgroundImages = [
  "https://i.imgur.com/XVRFwns.jpeg",
  "https://i.imgur.com/DXXvgjb.png",
  "https://i.imgur.com/LwoDuzZ.jpeg",
  "https://i.imgur.com/mtSrSYh.jpeg",
  "https://i.imgur.com/IVvEBc4.jpeg",
  "https://i.imgur.com/uJcd1bf.jpeg"
];

const backgroundCache = new Map();

async function loadBackgroundImage(url) {
  if (backgroundCache.has(url)) return backgroundCache.get(url);
  try {
    const { loadImage } = await getCanvas();
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
    const img = await loadImage(Buffer.from(res.data));
    backgroundCache.set(url, img);
    return img;
  } catch { return null; }
}

async function getUserPhoto(client, userId) {
  try {
    const { loadImage } = await getCanvas();
    const photos = await client.getUserProfilePhotos(userId, { limit: 1 });
    if (photos.total_count > 0) {
      const fileId = photos.photos[0][photos.photos[0].length - 1].file_id;
      const file = await client.getFile(fileId);
      const url = `https://api.telegram.org/file/bot${client.token}/${file.file_path}`;
      const res = await axios.get(url, { responseType: "arraybuffer" });
      return await loadImage(Buffer.from(res.data));
    }
  } catch {}
  return null;
}

async function drawProfile(ctx, img, x, y, size, color) {
  const r = size / 2;
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(x, y, r + 5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x, y, r + 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  if (img) {
    ctx.drawImage(img, x - r, y - r, size, size);
  } else {
    ctx.fillStyle = "#374151";
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = `bold ${r * 0.6}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", x, y);
  }
  ctx.restore();
}

async function createWelcomeCard(groupImg, userImg, adderImg, userName, memberCount, groupName, adderName) {
  const { createCanvas } = await getCanvas();
  const w = 1200, h = 700;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");

  const bgUrl = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
  const bg = await loadBackgroundImage(bgUrl);
  if (bg) ctx.drawImage(bg, 0, 0, w, h);
  else { ctx.fillStyle = "#0a0f1a"; ctx.fillRect(0, 0, w, h); }
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(0, 0, w, h);

  if (groupImg) await drawProfile(ctx, groupImg, w / 2, 200, 200, "#fff");
  if (userImg) await drawProfile(ctx, userImg, 120, h - 100, 150, "#10b981");
  if (adderImg) await drawProfile(ctx, adderImg, w - 120, 100, 150, "#3b82f6");

  ctx.font = 'bold 36px "Segoe UI"';
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(groupName, w / 2, 350);

  const grad = ctx.createLinearGradient(w / 2 - 180, 360, w / 2 + 180, 360);
  grad.addColorStop(0, "#3b82f6");
  grad.addColorStop(0.5, "#10b981");
  grad.addColorStop(1, "#ec4899");
  ctx.font = 'bold 72px "Segoe UI"';
  ctx.fillStyle = grad;
  ctx.fillText("WELCOME", w / 2, 450);

  ctx.font = 'bold 48px "Segoe UI"';
  ctx.fillStyle = "#10b981";
  ctx.fillText(userName, w / 2, 500);

  ctx.font = 'bold 28px "Segoe UI"';
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(`Member #${memberCount}`, w / 2, 585);

  ctx.textAlign = "left";
  ctx.fillStyle = "#10b981";
  ctx.font = 'bold 26px "Segoe UI"';
  ctx.fillText(userName, 220, h - 95);

  ctx.textAlign = "right";
  ctx.fillStyle = "#3b82f6";
  ctx.font = 'bold 22px "Segoe UI"';
  ctx.fillText(`Added by: ${adderName}`, w - 220, 105);

  ctx.font = '18px "Segoe UI"';
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText("© made by azadx69x", w - 10, h - 10);

  return canvas.toBuffer();
}

export default {
  name: "welcome",
  version: "1.0.0",
  author: "Azadx69x",
  role: 0,
  category: "welcome",

  onChat: async (client, message) => {
    if (!message.new_chat_members || message.new_chat_members.length === 0) return;

    for (const newMember of message.new_chat_members) {
      if (newMember.is_bot) continue;

      const chatId = message.chat.id;
      const userId = newMember.id;
      const userName = newMember.first_name + (newMember.last_name ? " " + newMember.last_name : "");
      const adderId = message.from?.id;
      let adderName = message.from?.first_name || "Unknown";
      if (message.from?.last_name) adderName += " " + message.from.last_name;

      try {
        const groupName = message.chat.title || "Group";
        let memberCount = 1;
        try {
          memberCount = await client.getChatMembersCount(chatId);
        } catch {}

        const userPhoto = await getUserPhoto(client, userId);
        const adderPhoto = adderId ? await getUserPhoto(client, adderId) : null;

        let groupPhoto = null;
        try {
          const { loadImage } = await getCanvas();
          const chat = await client.getChat(chatId);
          if (chat.photo) {
            const file = await client.getFile(chat.photo.big_file_id);
            const url = `https://api.telegram.org/file/bot${client.token}/${file.file_path}`;
            const res = await axios.get(url, { responseType: "arraybuffer" });
            groupPhoto = await loadImage(Buffer.from(res.data));
          }
        } catch {}

        const imgBuffer = await createWelcomeCard(groupPhoto, userPhoto, adderPhoto, userName, memberCount, groupName, adderName);
        const temp = path.join(__dirname, "../data", `welcome_${Date.now()}.png`);
        await fs.ensureDir(path.dirname(temp));
        fs.writeFileSync(temp, imgBuffer);

        const caption = `🌸 WELCOME 🌸\n━━━━━━━━━━━━━━━━━━━━━━\n🌷 Name: ${userName}\n🏷️ Group: ${groupName}\n🔢 Member #${memberCount}\n👤 Added by: ${adderName}\n━━━━━━━━━━━━━━━━━━━━━━\nEnjoy your stay! 😊`;
        await client.sendPhoto(chatId, temp, { caption });
        setTimeout(() => fs.unlink(temp).catch(() => {}), 10000);
      } catch (err) {
        console.error("Welcome error:", err.message);
        await client.sendMessage(chatId, `🌸 Welcome ${userName}! 🌸\nEnjoy your stay!`);
      }
    }
  },

  execute: async (client, message, args) => {
    await client.sendMessage(message.chat.id, "✅ Auto-welcome is active. Add a member to test it.");
  }
};
