import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Lindungi seluruh rute dashboard
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, req) => {
  // Jika ini rute dashboard dan dia bukan admin/belum login, lindungi!
  if (isDashboardRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Lewati file statis
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Selalu jalankan untuk API
    '/(api|trpc)(.*)',
  ],
};
