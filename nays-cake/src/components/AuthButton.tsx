"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function AuthButton() {
  const { isLoaded, isSignedIn } = useAuth();

  // PENGAMANAN DIHAPUS: Tombol dipaksa tampil walau Clerk sedang loading
  // if (!isLoaded) return (
  //    <div className="w-[140px] h-[40px] bg-gray-200 animate-pulse rounded-full"></div>
  // );

  return (
    <div className="flex items-center justify-center z-[50]">
      {!isSignedIn ? (
        <div className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg transition-all text-sm md:text-base border-2 border-white/20 hover:scale-105">
          <SignInButton mode="modal">Masuk / Daftar</SignInButton>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 pl-4 pr-2 rounded-full shadow-lg border border-white/30 text-white font-medium text-sm">
          <span>Akun Anda</span>
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
        </div>
      )}
    </div>
  );
}
