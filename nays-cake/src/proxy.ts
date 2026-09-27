import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isDashboardRoute(req)) {
    // Tidak memakai auth().protect() lagi karena bertabrakan, kita tangani dari UI & API
  }
});

// Wajib: Menjaga semua halaman dan jalur API
export const config = {
  matcher: [
    // Lindungi semua rute kecuali file statis
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Lindungi rute API
    '/(api|trpc)(.*)',
  ],
};
