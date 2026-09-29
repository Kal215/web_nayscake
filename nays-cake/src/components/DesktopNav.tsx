"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PackageSearch, ShoppingBag, User } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function DesktopNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Katalog", href: "/catalog", icon: PackageSearch },
    { name: "Keranjang", href: "/keranjang", icon: ShoppingBag },
  ];

  return (
    <nav className="hidden lg:flex fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200/50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              Nay's Cake
            </span>
          </Link>

          {/* Menus */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-amber-600 ${
                    isActive ? "text-amber-600" : "text-gray-600"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}

            {/* Profile / Auth */}
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <SignedIn>
                <div className="flex items-center gap-3">
                  <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors">
                    Dashboard
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
