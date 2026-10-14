import { createAuthClient } from "better-auth/react"; // must come from better-auth/react
import { adminClient } from "better-auth/client/plugins";

// No baseURL needed: the client calls the same origin at /api/auth.
export const authClient = createAuthClient({
  plugins: [adminClient()],
});