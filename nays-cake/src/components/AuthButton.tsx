"use client";

import { UserButton, useAuth, useClerk } from "@clerk/nextjs";

export default function AuthButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  return (
    <div className="flex items-center justify-center z-[50]">
      {!isSignedIn ? (
        <button 
          onClick={() => {
            if (isLoaded) {
              openSignIn();
            } else {
              alert("Sistem keamanan Clerk sedang dimuat ke HP Anda. Mohon tunggu 3 detik lalu klik lagi.");
            }
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg transition-all text-sm md:text-base border-2 border-white/20 hover:scale-105"
        >
          Masuk / Daftar
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 pl-4 pr-2 rounded-full shadow-lg border border-white/30 text-white font-medium text-sm">
          <span>Akun Anda</span>
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
        </div>
      )}
    </div>
  );
}
