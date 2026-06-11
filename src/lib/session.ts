import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { SessionData } from "@/lib/session-types";

export type { SessionData } from "@/lib/session-types";

const sessionPassword = (() => {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    return "configure-session-secret-with-32-plus-characters-on-render";
  }
  return "development-secret-min-32-chars!!";
})();

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: "zwei-bruder-admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: process.env.NEXT_PUBLIC_BASE_PATH || "/",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function getSessionSafe(): Promise<SessionData> {
  try {
    return await getSession();
  } catch {
    return {};
  }
}
