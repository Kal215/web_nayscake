"use client";

import { UserButton, useAuth, useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { user } = useUser();

  // Cek apakah yang sedang login adalah Anda (Admin)
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "riskalfadhilla215@gmail.com";

  return (
    <div className="flex items-center justify-center z-[50]">
      {!isSignedIn ? (
        <button
          onClick={() => 
            isLoaded 
              // FORCE REDIRECT: Memaksa Clerk melempar ke Stasiun Transit tanpa peduli dari mana asalnya
              ? openSignIn({ forceRedirectUrl: '/auth-sync' }) 
              : alert("Sistem keamanan sedang dimuat, mohon tunggu 3 detik dan coba lagi.")
          }
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg transition-all text-sm md:text-base border-2 border-white/20 hover:scale-105"
        >
          Masuk / Daftar
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 pl-4 pr-2 rounded-full shadow-lg border border-white/30 text-white font-medium text-sm">
          {isAdmin ? (
            <Link 
              href="/dashboard" 
              className="hover:text-amber-300 transition-colors font-bold"
            >
              Ke Dashboard
            </Link>
          ) : (
            <span>Akun Anda</span>
          )}
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
        </div>
      )}
    </div>
  );
}
