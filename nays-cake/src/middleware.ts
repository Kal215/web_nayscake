import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Lindungi seluruh rute dashboard
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isDashboardRoute(req)) {
    // 1. Jika belum login, tendang ke halaman login
    auth().protect();

    // 2. Jika sudah login, cek apakah dia admin?
    const role = auth().sessionClaims?.metadata?.role;
    
    if (role !== "admin") {
      // Jika BUKAN admin (contoh: pembeli biasa yang coba-coba akses url /dashboard),
      // Tendang kembali ke halaman utama katalog!
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
