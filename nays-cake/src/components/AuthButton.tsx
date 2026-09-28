"use client";

import { UserButton, useAuth, useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { LogIn, LayoutDashboard, Store, Loader2 } from "lucide-react";

export default function AuthButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const isAdmin = user?.primaryEmailAddress?.emailAddress === "riskalfadhilla215@gmail.com";

  return (
    <div className="flex items-center justify-center z-[50]">
      {/* 
        SUNTIKAN FISIKA NEUMORPHISM MURNI (BULAT PENUH)
      */}
      <style dangerouslySetInnerHTML={{__html: `
        .neo-btn-raised {
          background: var(--neo-base);
          color: var(--neo-ink);
          box-shadow: 4px 4px 9px var(--neo-shadow), -4px -4px 9px var(--neo-light);
          border: 1px solid #d1dbd7;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .neo-btn-raised:hover { 
          background: #f5f8f7; 
        }
        .neo-btn-raised:active {
          box-shadow: var(--neo-inset);
          background: #e5eeea;
          transform: scale(0.96); /* Animasi fisik ditekan ke dalam */
        }
        
        .neo-btn-inset {
          background: var(--neo-base);
          box-shadow: var(--neo-inset);
          border: 1px solid #d1dbd7;
          transition: all 300ms ease;
        }
      `}} />

      {!isLoaded ? (
         <div className="neo-btn-raised flex items-center justify-center px-6 py-2.5 rounded-full">
           <Loader2 className="w-5 h-5 animate-spin opacity-50" />
         </div>
      ) : !isSignedIn ? (
        // KONDISI 1: Belum Login -> Tampilkan Tombol Katalog (Utama) dan Tombol Login (Kecil)
        <div className="neo-btn-inset flex items-center gap-2 md:gap-3 px-2 py-1.5 md:px-3 md:py-2 rounded-full">
          <Link 
            href="/catalog" 
            className="neo-btn-raised group flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-semibold"
          >
            <Store className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="tracking-wide">Katalog</span>
          </Link>

          <div className="neo-btn-inset w-[2px] h-5 md:h-7 mx-0.5 rounded-full border-none opacity-50"></div>

          <button
            onClick={() => openSignIn()}
            className="neo-btn-raised group flex items-center justify-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold cursor-pointer"
            aria-label="Login / Dasbor"
            title="Login untuk Checkout / Dashboard Admin"
          >
            <LogIn className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline text-xs md:text-sm tracking-wide">Login</span>
          </button>
        </div>
      ) : (
        // KONDISI 2: Sudah Login -> Wadah Utama Tenggelam ke Dalam
        <div className="neo-btn-inset flex items-center gap-2 md:gap-3 px-2 py-1.5 md:px-3 md:py-2 rounded-full">
          
          {isAdmin ? (
            // Tombol Dasbor & Katalog untuk Admin
            <>
              <Link 
                href="/dashboard" 
                className="neo-btn-raised group flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold"
              >
                <LayoutDashboard className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline tracking-wide">Dashboard</span>
              </Link>
              <Link 
                href="/catalog" 
                className="neo-btn-raised group flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-semibold"
              >
                <Store className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline tracking-wide">Katalog</span>
                <span className="inline sm:hidden">Katalog</span>
              </Link>
            </>
          ) : (
            // Tombol Pelanggan -> Menonjol dari dalam cekungan
            <Link 
              href="/catalog" 
              className="neo-btn-raised group flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-semibold"
            >
              <Store className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline tracking-wide">Katalog</span>
              <span className="inline sm:hidden">Katalog</span>
            </Link>
          )}

          {/* Garis Pemisah -> Ikut Tenggelam */}
          <div className="neo-btn-inset w-[2px] h-5 md:h-7 mx-1 rounded-full border-none opacity-50"></div>

          {/* Tombol Logout (Avatar) -> Menonjol, bisa ditekan ke dalam */}
          <div className="neo-btn-raised relative rounded-full p-1 mr-1 flex items-center justify-center cursor-pointer">
             <UserButton 
               appearance={{ 
                 elements: { 
                   avatarBox: "w-7 h-7 md:w-9 md:h-9 border border-[#d1dbd7] rounded-full",
                   userButtonPopoverCard: "shadow-[4px_4px_9px_var(--neo-shadow),-4px_-4px_9px_var(--neo-light)] rounded-3xl border border-[#d1dbd7] font-sans",
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
