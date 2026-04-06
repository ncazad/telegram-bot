import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import logger from "../utils/logger.js";

mongoose.set("strictQuery", false);

const __dirname = dirname(fileURLToPath(import.meta.url));

function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  try {
    const config = JSON.parse(readFileSync(join(__dirname, "../config.json"), "utf8"));
    return config?.database?.uriMongodb || null;
  } catch {
    return null;
  }
}

let isConnected = false;

async function connectMongo() {
  const uri = getMongoUri();
  if (!uri) {
    logger.warn("MONGODB_URI not set — MongoDB features disabled");
    return false;
  }
  if (isConnected) return true;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    isConnected = true;
    logger.success("MongoDB connected");
    return true;
  } catch (err) {
    logger.error("MongoDB connection failed: " + err.message);
    return false;
  }
}

const UserSchema = new mongoose.Schema({
  userId:   { type: Number, required: true, unique: true },
  name:     { type: String, default: null },
  username: { type: String, default: "" },
  money:    { type: Number, default: 0 },
  exp:      { type: Number, default: 0 },
  banned:   { type: Boolean, default: false },
  data:     { type: mongoose.Schema.Types.Mixed, default: {} },
  joinedAt: { type: Date, default: Date.now }
}, { strict: false });

const ThreadSchema = new mongoose.Schema({
  threadId: { type: Number, required: true, unique: true },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  data:     { type: mongoose.Schema.Types.Mixed, default: {} }
}, { strict: false });

const GlobalSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed }
});

const UserModel   = mongoose.models.BotUser   || mongoose.model("BotUser",   UserSchema);
const ThreadModel = mongoose.models.BotThread || mongoose.model("BotThread", ThreadSchema);
const GlobalModel = mongoose.models.BotGlobal || mongoose.model("BotGlobal", GlobalSchema);

export { connectMongo, UserModel, ThreadModel, GlobalModel, isConnected };
