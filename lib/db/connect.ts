import mongoose from "mongoose";
import { getDatabaseConfig } from "@/lib/config/env";

interface MongooseCache {
  connection: typeof mongoose | null;
  pendingConnection: Promise<typeof mongoose> | null;
}

// Next.js re-evaluates modules on hot reload; a global keeps one connection alive.
const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache = (globalWithMongoose.mongooseCache ??= {
  connection: null,
  pendingConnection: null,
});

// Treats query filter objects as literal values, blocking NoSQL operator injection.
mongoose.set("sanitizeFilter", true);

/**
 * Returns a shared Mongoose connection, creating it on first call.
 * Logs once when a new connection is established.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.connection) return cache.connection;

  if (!cache.pendingConnection) {
    const { uri, name, maxPoolSize, serverSelectionTimeoutMs } = getDatabaseConfig();

    // bufferCommands off: fail fast instead of silently queueing queries.
    cache.pendingConnection = mongoose
      .connect(uri, {
        dbName: name,
        maxPoolSize,
        serverSelectionTimeoutMS: serverSelectionTimeoutMs,
        bufferCommands: false,
      })
      .then((connectedMongoose) => {
        const { host, name: databaseName } = connectedMongoose.connection;
        // Host and database only: the URI contains credentials.
        console.log(`✅ MongoDB connected: ${host}/${databaseName}`);
        return connectedMongoose;
      });
  }

  try {
    cache.connection = await cache.pendingConnection;
  } catch (error) {
    cache.pendingConnection = null; // allow a retry on the next call
    console.error("❌ MongoDB connection failed:", (error as Error).message);
    throw error;
  }
  return cache.connection;
}