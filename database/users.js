import { connectMongo, UserModel as User } from "./mongodb.js";

async function ensureConnected() {
  await connectMongo();
}

async function getUser(userId) {
  await ensureConnected();
  let user = await User.findOne({ userId: Number(userId) });
  if (!user) {
    user = await User.create({ userId: Number(userId) });
  }
  return user.toObject();
}

async function setUser(userId, data) {
  await ensureConnected();
  const user = await User.findOneAndUpdate(
    { userId: Number(userId) },
    { $set: data },
    { upsert: true, new: true }
  );
  return user.toObject();
}

async function get(userId, key, defaultValue = null) {
  const user = await getUser(userId);
  return key ? (user[key] ?? defaultValue) : user;
}

async function set(userId, key, value) {
  await setUser(userId, { [key]: value });
  return value;
}

async function getAll() {
  await ensureConnected();
  const all = await User.find();
  const result = {};
  for (const u of all) {
    result[u.userId] = u.toObject();
  }
  return result;
}

async function getMoney(userId) {
  return (await getUser(userId)).money || 0;
}

async function addMoney(userId, amount) {
  await ensureConnected();
  const user = await User.findOneAndUpdate(
    { userId: Number(userId) },
    { $inc: { money: amount } },
    { upsert: true, new: true }
  );
  return user.money;
}

async function subtractMoney(userId, amount) {
  return addMoney(userId, -amount);
}

async function getExp(userId) {
  return (await getUser(userId)).exp || 0;
}

async function addExp(userId, amount) {
  await ensureConnected();
  const user = await User.findOneAndUpdate(
    { userId: Number(userId) },
    { $inc: { exp: amount } },
    { upsert: true, new: true }
  );
  return user.exp;
}

async function getName(userId) {
  return (await getUser(userId)).name;
}

async function setName(userId, name) {
  return set(userId, "name", name);
}

async function refreshInfo(client, userId) {
  try {
    const chat = await client.getChat(userId);
    const name = chat.first_name + (chat.last_name ? " " + chat.last_name : "");
    await setName(userId, name);
    return name;
  } catch {
    return null;
  }
}

async function getAvatarUrl(client, userId) {
  try {
    const photos = await client.getUserProfilePhotos(userId, { limit: 1 });
    if (photos.total_count > 0) {
      const fileId = photos.photos[0][photos.photos[0].length - 1].file_id;
      const file = await client.getFile(fileId);
      return `https://api.telegram.org/file/bot${client.token}/${file.file_path}`;
    }
  } catch {}
  return "https://i.ibb.co/bBSpr5v/143086968-2856368904622192-1959732218791162458-n.png";
}

export default {
  getAll, getUser, setUser,
  get, set,
  getMoney, addMoney, subtractMoney,
  getExp, addExp,
  getName, setName,
  refreshInfo, getAvatarUrl
};
