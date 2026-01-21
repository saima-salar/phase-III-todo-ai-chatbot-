// frontend/auth.config.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const authConfig = betterAuth({
  database: {
    provider: "sqlite",
    url: process.env.DATABASE_URL || "sqlite:///./auth.sqlite",
  },
  secret: process.env.BETTER_AUTH_JWT_SECRET || process.env.BETTER_AUTH_SECRET || "d0a5c7b8cf3b4a9e8f1e2d3c4b5a6f7e8d9c0b1a2e3f4d5c6b7a8c9d0e1f2a3b",
  trustHost: true,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    jwt({
      secret: process.env.BETTER_AUTH_JWT_SECRET || process.env.BETTER_AUTH_SECRET || "d0a5c7b8cf3b4a9e8f1e2d3c4b5a6f7e8d9c0b1a2e3f4d5c6b7a8c9d0e1f2a3b",
    })
  ],
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:8000",
    "http://localhost:8080",
    "https://localhost:3000",
    "https://localhost:3001",
    "https://localhost:3002",
    "https://localhost:3003",
    "https://localhost:3004",
    "https://localhost:8000",
    "https://localhost:8080"
  ],
});