import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ChatWidget } from "@/components/chat/chat-widget";
import AuthButton from "@/components/AuthButton";

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
          

          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[9999]">
          <AuthButton />
        </div>
        {children}
          {process.env.CHAT_ENABLED === "true" && <ChatWidget />}
        </body>
      </html>
    </ClerkProvider>
  );
}
