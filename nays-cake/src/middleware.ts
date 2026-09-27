import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAuthSyncRoute = createRouteMatcher(["/auth-sync(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req) || isAuthSyncRoute(req)) {
    const authObj = await auth();
    if (!authObj.userId) {
      const signInUrl = new URL('/', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
