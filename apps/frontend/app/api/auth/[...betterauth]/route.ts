// frontend/app/api/auth/[...betterauth]/route.ts
import { auth } from "../../../../lib/better-auth-server";

export const GET = async (req: Request) => {
  const { pathname, searchParams } = new URL(req.url);
  return auth.handler({
    method: "GET",
    url: `${pathname}?${searchParams}`,
    request: req,
  });
};

export const POST = async (req: Request) => {
  const { pathname, searchParams } = new URL(req.url);
  const body = await req.text();
  return auth.handler({
    method: "POST",
    url: `${pathname}?${searchParams}`,
    request: req,
    body,
  });
};