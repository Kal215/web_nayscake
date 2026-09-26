import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req)) {
    // Di Clerk V5, auth() sekarang mengembalikan Promise, jadi harus pakai "await"
    const authObject = await auth();

    // 1. Jika belum login sama sekali, tendang ke halaman login Clerk
    if (!authObject.userId) {
      const signInUrl = new URL("/", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // 2. Jika sudah login, mari periksa ID Card (Metadata) miliknya
    const role = authObject.sessionClaims?.metadata?.role;
    
    if (role !== "admin") {
      // Jika ternyata dia pembeli (role bukan admin), tendang ke katalog!
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
