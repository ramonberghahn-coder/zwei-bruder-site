import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";
import type { SessionData } from "@/lib/session";

const sessionPassword =
  process.env.SESSION_SECRET || "development-secret-min-32-chars!!";

async function isAuthenticated(request: NextRequest) {
  const sealed = request.cookies.get("zwei-bruder-admin")?.value;
  if (!sealed) return false;

  try {
    const session = await unsealData<SessionData>(sealed, {
      password: sessionPassword,
    });
    return !!session.isAdmin;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const isAdminArea =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isPublicAdmin =
    pathname === "/admin/login" || pathname === "/api/admin/login";

  if (isAdminArea && !isPublicAdmin) {
    const authed = await isAuthenticated(request);
    if (!authed) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
