import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ChatWidget } from "@/components/chat/chat-widget";
import MobileNav from "@/components/MobileNav";
import DesktopNav from "@/components/DesktopNav";
import FloatingCart from "@/components/FloatingCart";

export const metadata: Metadata = {
  title: "Nay's Cake Universal",
  description: "Aplikasi Pelanggan dan Sistem Kasir Admin Nayscake",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="id" className="h-full antialiased">
        <body className="min-h-full flex flex-col relative bg-gray-50">
          <DesktopNav />
          {/* Konten Utama */}
          <main className="flex-1 w-full lg:pt-16">
            {children}
          </main>

          {/* Navigasi Bawah Universal (Bottom Navigation) */}
          <MobileNav />
        <FloatingCart />

          {process.env.CHAT_ENABLED === "true" && <ChatWidget />}
        </body>
      </html>
    </ClerkProvider>
  );
}
