"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Store, Calculator, UserRound, ShoppingCart, LayoutDashboard } from "lucide-react";
import { useAuth, SignInButton, useUser } from "@clerk/nextjs";

export default function MobileNav() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  
  if (!isLoaded) return null;

  const isAdmin = user?.primaryEmailAddress?.emailAddress === "riskalfadhilla215@gmail.com";

  const navItems = [
    { name: "Beranda", href: "/", icon: Store }
  ];

  if (isAdmin) {
    navItems.push({ name: "Kasir", href: "/dashboard/kasir", icon: Calculator });
    navItems.push({ name: "Admin", href: "/dashboard", icon: LayoutDashboard });
  }

  return (
    <>
      <div className="pb-[80px]" /> 
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[100] px-2 py-2 safe-area-bottom">
        <div className="max-w-md mx-auto flex justify-around items-center">
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isStrictActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${isStrictActive ? "text-black scale-110" : "text-gray-400 hover:text-gray-600"}`}
              >
                <div className={`${isStrictActive ? "bg-gray-100 shadow-inner" : ""} p-2 rounded-xl transition-colors`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={isStrictActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] md:text-xs font-semibold mt-1 ${isStrictActive ? "opacity-100" : "opacity-80"}`}>{item.name}</span>
              </Link>
            );
          })}

          <Link href="/catalog" className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${pathname?.startsWith("/catalog") ? "text-black scale-110" : "text-gray-400 hover:text-gray-600"}`}>
            <div className={`${pathname?.startsWith("/catalog") ? "bg-gray-100 shadow-inner" : ""} p-2 rounded-xl transition-colors`}>
              <Store className="w-5 h-5 md:w-6 md:h-6" strokeWidth={pathname?.startsWith("/catalog") ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] md:text-xs font-semibold mt-1 ${pathname?.startsWith("/catalog") ? "opacity-100" : "opacity-80"}`}>Katalog</span>
          </Link>

          {isSignedIn && (
            <Link href="/keranjang" className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${pathname?.startsWith("/keranjang") ? "text-black scale-110" : "text-gray-400 hover:text-gray-600"}`}>
              <div className={`${pathname?.startsWith("/keranjang") ? "bg-gray-100 shadow-inner" : ""} p-2 rounded-xl transition-colors`}>
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" strokeWidth={pathname?.startsWith("/keranjang") ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] md:text-xs font-semibold mt-1 ${pathname?.startsWith("/keranjang") ? "opacity-100" : "opacity-80"}`}>Keranjang</span>
            </Link>
          )}

          {isSignedIn ? (
            <Link href="/profil" className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${pathname?.startsWith("/profil") ? "text-black scale-110" : "text-gray-400 hover:text-gray-600"}`}>
              <div className={`${pathname?.startsWith("/profil") ? "bg-gray-100 shadow-inner" : ""} p-2 rounded-xl transition-colors`}>
                <UserRound className="w-5 h-5 md:w-6 md:h-6" strokeWidth={pathname?.startsWith("/profil") ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] md:text-xs font-semibold mt-1 ${pathname?.startsWith("/profil") ? "opacity-100" : "opacity-80"}`}>Profil</span>
            </Link>
          ) : (
            <SignInButton mode="modal" forceRedirectUrl="/auth-sync">
              <button className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600">
                <div className="p-2 rounded-xl transition-colors">
                  <UserRound className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                </div>
                <span className="text-[10px] md:text-xs font-semibold mt-1 opacity-80">Masuk</span>
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </>
  );
}
