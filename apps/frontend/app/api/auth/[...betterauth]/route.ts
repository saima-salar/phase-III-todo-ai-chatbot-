// frontend/app/api/auth/[...betterauth]/route.ts
import { auth } from "../../../../lib/better-auth-server";

export const { GET, POST } = auth;