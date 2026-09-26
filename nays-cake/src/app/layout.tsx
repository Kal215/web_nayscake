import type { Metadata } from "next";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import "./globals.css";
import { ChatWidget } from "@/components/chat/chat-widget";

export const metadata: Metadata = {
  title: "Nay's Cake Website",
  description: "Sistem Manajemen Inventori dan Penjualan Nay's Cake",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="id" className="h-full antialiased">
        <body className="min-h-full flex flex-col relative">
          
          {/* Tombol Auth Melayang Global */}
          <div className="absolute top-4 right-4 z-[9999]">
            <SignedOut>
              <div className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full font-medium shadow-lg transition-all">
                <SignInButton mode="modal">Login Admin</SignInButton>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="bg-white p-1 rounded-full shadow-lg border border-gray-200">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>

          {children}
          {process.env.CHAT_ENABLED === "true" && <ChatWidget />}
        </body>
      </html>
    </ClerkProvider>
  );
}
