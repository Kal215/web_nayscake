import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Daftar hitam: rute yang haram diakses tanpa login
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/catalog(.*)",
  "/auth-sync(.*)",
  "/api/dashboard(.*)"
]);

export default clerkMiddleware((auth, req) => {
  // Jika pengunjung mencoba masuk rute terlarang
  if (isProtectedRoute(req)) {
    // protect() akan menolak akses dan melemparnya ke halaman SignIn Clerk
    auth().protect();
  }
});

// Wajib: Menjaga semua rute
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
