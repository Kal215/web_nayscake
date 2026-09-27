"use client";

import { UserButton, useAuth, useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { LogIn, LayoutDashboard, Store, Loader2 } from "lucide-react";

export default function AuthButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { user } = useUser();

  // Validasi absolut: Hanya email Anda yang dikenali sebagai Admin
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "riskalfadhilla215@gmail.com";

  return (
    <div className="flex items-center justify-center z-[50]">
      {!isLoaded ? (
         // Status Loading Premium
         <div className="flex items-center justify-center px-6 py-2.5 md:py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
           <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
         </div>
      ) : !isSignedIn ? (
        // Tombol Masuk/Daftar (Modern Enterprise)
        <button
          onClick={() => openSignIn({ forceRedirectUrl: '/auth-sync' })}
          className="group relative overflow-hidden flex items-center justify-center gap-2.5 px-6 py-2.5 md:px-8 md:py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold rounded-full shadow-[0_8px_20px_-6px_rgba(245,158,11,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(245,158,11,0.8)] transition-all duration-300 hover:-translate-y-1 border border-amber-300/40"
        >
          <LogIn className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm md:text-base tracking-wide drop-shadow-md">Masuk / Daftar</span>
          {/* Efek kilap kaca saat disentuh */}
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      ) : (
        // Wrapper Transparan untuk User (Kaca Mewah)
        <div className="flex items-center gap-2 md:gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl px-2 py-1.5 md:px-3 md:py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/30 transition-all duration-300">
          
          {isAdmin ? (
            // Pintu Rahasia Admin
            <Link 
              href="/dashboard" 
              className="group flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2 bg-gradient-to-br from-gray-900 to-gray-800 text-amber-400 rounded-full text-xs md:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700/50 hover:border-amber-500/50"
            >
              <LayoutDashboard className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline tracking-wide">Dashboard Admin</span>
              <span className="inline sm:hidden tracking-wide">Admin</span>
            </Link>
          ) : (
            // Pintu Pembeli Biasa (Customer)
            <Link 
              href="/catalog" 
              className="group flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2 bg-white/20 text-white hover:bg-white/30 rounded-full text-xs md:text-sm font-semibold shadow-md transition-all duration-300"
            >
              <Store className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline tracking-wide">Mulai Belanja</span>
              <span className="inline sm:hidden">Belanja</span>
            </Link>
          )}

          {/* Garis Pemisah (Vertical Divider) */}
          <div className="w-[1px] h-5 md:h-7 bg-white/30 mx-1 md:mx-1.5 rounded-full"></div>

          {/* Kustomisasi Avatar Clerk & Tombol Logout */}
          <div className="relative hover:scale-105 transition-transform duration-300 mr-1">
             <UserButton 
               appearance={{ 
                 elements: { 
                   avatarBox: "w-7 h-7 md:w-9 md:h-9 border-2 border-amber-400/80 shadow-md",
                   userButtonPopoverCard: "shadow-2xl rounded-2xl border border-gray-100 font-sans",
                   userButtonTrigger: "focus:shadow-none focus:outline-none"
                 } 
               }} 
             />
          </div>
        </div>
      )}
    </div>
  );
}
