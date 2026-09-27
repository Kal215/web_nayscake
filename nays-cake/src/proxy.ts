import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/catalog(.*)",
  "/auth-sync(.*)",
  "/api/dashboard(.*)"
]);

// Tambahkan async di sini
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Tambahkan await untuk Promise Clerk V7
    await (await auth()).protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
