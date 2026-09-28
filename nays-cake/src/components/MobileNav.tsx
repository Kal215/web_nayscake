"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Store, Calculator, UserRound } from "lucide-react";
import { useAuth, UserButton, useUser } from "@clerk/nextjs";

export default function MobileNav() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  
  // Jika belum loading, sembunyikan navigasi dulu untuk mencegah kedip
  if (!isLoaded) return null;

  const isAdmin = user?.primaryEmailAddress?.emailAddress === "riskalfadhilla215@gmail.com";

  // Kita tentukan item menu secara dinamis
  const navItems = [];
  
  // Semua orang bisa lihat Katalog
  navItems.push({
    name: "Katalog",
    href: "/catalog",
    icon: Store
  });

  // Hanya Admin yang melihat menu Dasbor & Kasir
  if (isAdmin) {
    navItems.push({
      name: "Kasir POS",
      href: "/dashboard/kasir",
      icon: Calculator
    });
    navItems.push({
      name: "Admin",
      href: "/dashboard",
      icon: LayoutDashboard
    });
  }

  return (
    <>
      {/* Spacer agar konten tidak tertutup navbar */}
      <div className="pb-[80px]" /> 
      
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[100] px-2 py-2 safe-area-bottom">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Deteksi rute aktif
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href) && item.href !== "/dashboard");
            // Khusus dashboard admin (karena /dashboard/kasir juga startsWith /dashboard, kita harus strict)
            const isStrictActive = item.href === "/dashboard" ? pathname === "/dashboard" : isActive;

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  isStrictActive 
                    ? "text-black scale-110" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div className={`${isStrictActive ? "bg-gray-100 shadow-inner" : ""} p-2 rounded-xl transition-colors`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={isStrictActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] md:text-xs font-semibold mt-1 ${isStrictActive ? "opacity-100" : "opacity-80"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* User Button di paling ujung */}
          <div className="flex flex-col items-center justify-center p-2">
            <div className="p-1">
              {isSignedIn ? (
                <UserButton 
                  appearance={{ 
                    elements: { 
                      avatarBox: "w-7 h-7 md:w-8 md:h-8",
                    } 
                  }} 
                />
              ) : (
                <Link href="/auth-sync" className="text-gray-400">
                  <UserRound className="w-5 h-5 md:w-6 md:h-6" />
                </Link>
              )}
            </div>
            <span className="text-[10px] md:text-xs font-semibold mt-1 text-gray-500">
              Profil
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
