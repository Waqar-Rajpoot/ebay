import "server-only";
import mongoose from "mongoose";
import { getServerConfig } from "@/lib/config";

interface MongooseCache {
  connectionPromise?: Promise<typeof mongoose>;
}

const globalForMongoose = globalThis as typeof globalThis & { mongooseCache?: MongooseCache };
const mongooseCache: MongooseCache = (globalForMongoose.mongooseCache ??= {});

export function connectToDatabase(): Promise<typeof mongoose> {
  if (!mongooseCache.connectionPromise) {
    const config = getServerConfig();

    mongooseCache.connectionPromise = mongoose
      .connect(config.mongodbUri, { dbName: config.mongodbDbName })
      .catch((error: unknown) => {
        mongooseCache.connectionPromise = undefined;
        throw error;
      });
  }
  return mongooseCache.connectionPromise;
}