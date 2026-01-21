// frontend/lib/auth.ts
import { createAuthClient } from "better-auth/react";
import { jwt } from "better-auth/client/plugins";

export const auth = createAuthClient({
  plugins: [
    jwt({
      secret: process.env.NEXT_PUBLIC_BETTER_AUTH_JWT_SECRET || "fallback-secret-for-dev",
    }),
  ],
});

// Export types for convenience
export type { Session } from "better-auth";