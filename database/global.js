import { connectMongo, GlobalModel as Global } from "./mongodb.js";

async function ensureConnected() {
  await connectMongo();
}

async function getAll() {
  await ensureConnected();
  const all = await Global.find();
  const result = {};
  for (const doc of all) {
    result[doc.key] = doc.value;
  }
  return result;
}

async function get(key, pathStr = null, defaultValue = null) {
  await ensureConnected();
  const doc = await Global.findOne({ key });
  if (!doc) return defaultValue;
  let value = doc.value;
  if (pathStr) {
    for (const part of pathStr.split(".")) {
      if (value === undefined || value === null) return defaultValue;
      value = value[part];
    }
  }
  return value !== undefined ? value : defaultValue;
}

async function set(key, updateData, pathStr = null) {
  await ensureConnected();
  let value = updateData;
  if (pathStr) {
    const existing = (await Global.findOne({ key }))?.value || {};
    const parts = pathStr.split(".");
    const last = parts.pop();
    let target = existing;
    for (const part of parts) {
      if (!target[part]) target[part] = {};
      target = target[part];
    }
    target[last] = updateData;
    value = existing;
  }
  await Global.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
  return value;
}

async function deleteKey(key, pathStr = null) {
  await ensureConnected();
  if (!pathStr) {
    await Global.deleteOne({ key });
    return true;
  }
  const doc = await Global.findOne({ key });
  if (!doc) return false;
  const val = doc.value || {};
  const parts = pathStr.split(".");
  const last = parts.pop();
  let target = val;
  for (const part of parts) {
    if (!target[part]) return false;
    target = target[part];
  }
  delete target[last];
  await Global.findOneAndUpdate({ key }, { value: val });
  return true;
}

async function create(key, data) {
  await ensureConnected();
  const existing = await Global.findOne({ key });
  if (existing) throw new Error(`Key "${key}" already exists`);
  await Global.create({ key, value: { ...data, key } });
  return { ...data, key };
}

async function remove(key) {
  return deleteKey(key);
}

async function exists(key) {
  await ensureConnected();
  return !!(await Global.findOne({ key }));
}

export default {
  getAll, get, set,
  deleteKey, create, remove,
  exists, existsSync: exists
};
