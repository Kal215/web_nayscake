import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Nay's Cake Website", // Ini akan mengubah tulisan di tab browser
  description: "Sistem Manajemen Inventori dan Penjualan Nay's Cake", // Ini baik untuk SEO/Pencarian
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
