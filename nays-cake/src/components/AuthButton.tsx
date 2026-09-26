"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function AuthButton() {
  const { isLoaded, isSignedIn } = useAuth();

  // Jika Clerk belum selesai memuat, jangan tampilkan apa-apa (hindari error Prerender)
  if (!isLoaded) return null;

  return (
    <div className="absolute top-4 right-4 z-[9999]">
      {!isSignedIn ? (
        <div className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full font-medium shadow-lg transition-all">
          <SignInButton mode="modal">Masuk / Daftar</SignInButton>
        </div>
      ) : (
        <div className="bg-white p-1 rounded-full shadow-lg border border-gray-200">
          <UserButton />
        </div>
      )}
    </div>
  );
}
