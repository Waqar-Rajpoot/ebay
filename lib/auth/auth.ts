import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { getServerConfig } from "@/lib/config";
import { connectToDatabase } from "@/lib/db/mongoose";
import { USER_ROLES, resolveInitialRole } from "@/lib/auth/roles";

const config = getServerConfig();

// Top-level await: the adapter needs a connected native client at construction time.
const mongooseInstance = await connectToDatabase();
const mongoClient = mongooseInstance.connection.getClient();
const mongoDatabase = mongoClient.db(config.mongodbDbName);

export const auth = betterAuth({
  baseURL: config.betterAuthUrl,
  secret: config.betterAuthSecret,
  // Passing `client` enables transactions; only valid on replica sets / sharded clusters.
  database: mongodbAdapter(mongoDatabase, {
    client: config.mongodbTransactionsEnabled ? mongoClient : undefined,
  }),
  socialProviders: {
    google: {
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
      prompt: "select_account",
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Runs once, at first sign-up. Later role changes go through the admin panel.
        before: async (user) => ({
          data: { ...user, role: resolveInitialRole(user, config.adminEmails) },
        }),
      },
    },
  },
  plugins: [
    admin({ defaultRole: USER_ROLES.USER }),
    nextCookies(), // must be the last plugin in the array
  ],
});