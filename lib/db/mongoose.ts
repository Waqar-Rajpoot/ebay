import "server-only";
import mongoose from "mongoose";

interface MongooseCache {
  connection: typeof mongoose | null;
  pendingConnection: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis.mongooseCache ?? { connection: null, pendingConnection: null };
globalThis.mongooseCache = cache;

export default async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.connection) return cache.connection;

  if (!cache.pendingConnection) {
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
      throw new Error("MONGODB_URI is not set");
    }

    cache.pendingConnection = mongoose.connect(connectionString, {
      dbName: process.env.MONGODB_DB_NAME || undefined,
      bufferCommands: false,
      serverSelectionTimeoutMS: process.env.SERVER_SELECTION_TIMEOUT_MS
        ? parseInt(process.env.SERVER_SELECTION_TIMEOUT_MS, 10)
        : undefined,
      maxPoolSize: process.env.MAX_POOL_SIZE ? parseInt(process.env.MAX_POOL_SIZE, 10) : undefined,
    });
  }

  try {
    cache.connection = await cache.pendingConnection;
  } catch (error) {
    cache.pendingConnection = null;
    throw error;
  }

  return cache.connection;
}