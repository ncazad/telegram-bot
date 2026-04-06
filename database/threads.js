import { connectMongo, ThreadModel as Thread } from "./mongodb.js";

async function ensureConnected() {
  await connectMongo();
}

async function getThread(threadId) {
  await ensureConnected();
  let thread = await Thread.findOne({ threadId: Number(threadId) });
  if (!thread) {
    thread = await Thread.create({ threadId: Number(threadId) });
  }
  return thread.toObject();
}

async function setThread(threadId, data) {
  await ensureConnected();
  const thread = await Thread.findOneAndUpdate(
    { threadId: Number(threadId) },
    { $set: data },
    { upsert: true, new: true }
  );
  return thread.toObject();
}

async function get(threadId, key, defaultValue = null) {
  const thread = await getThread(threadId);
  return key ? (thread[key] ?? defaultValue) : thread;
}

async function set(threadId, key, value) {
  await setThread(threadId, { [key]: value });
  return value;
}

export default {
  getThread, setThread,
  get, set
};
