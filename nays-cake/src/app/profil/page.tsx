import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";
import Link from "next/link";
import { Package, ChefHat } from "lucide-react";

export default async function ProfilPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/"); // Soft-gate: usir ke beranda jika belum login
  }

  const primaryEmail = user.emailAddresses[0]?.emailAddress;
  const isAdmin = ["riskalfadhilla215@gmail.com", "nayscake16@gmail.com", "atinayscake@gmail.com"].includes(primaryEmail || "");

  // Ambil data user dari DB
  let dbUser = null;
  if (primaryEmail) {
    dbUser = await prisma.user.findUnique({
      where: { email: primaryEmail }
    });
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 pt-12 pb-[100px] font-sans">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-100 overflow-hidden">
        
        {/* Header Profil (Desain Elegan) */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black px-6 py-12 text-center relative">
          <div className="absolute top-4 right-4 bg-white/10 p-1 rounded-full backdrop-blur-md">
            <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
          </div>
          
          <div className="w-24 h-24 bg-white rounded-full border-4 border-white/20 mx-auto mb-4 overflow-hidden shadow-2xl relative">
            <img src={user.imageUrl} alt="Profil" className="w-full h-full object-cover" />
          </div>
          
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {user.firstName ? `${user.firstName} ${user.lastName || ''}` : "Pengguna Nayscake"}
          </h2>
          <p className="text-amber-300/80 text-sm mt-1">{primaryEmail}</p>
          
          {isAdmin && (
            <div className="mt-5">
              <span className="inline-block bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-amber-500/20">
                ⭐ Admin Nays
              </span>
            </div>
          )}
        </div>

        {/* Akses Cepat Admin */}
        {isAdmin && (
          <div className="px-6 pt-6">
             <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-black text-amber-400 font-semibold py-3 rounded-xl transition-all shadow-md">
               <ChefHat className="w-5 h-5" />
               Masuk ke Sistem Kasir
             </Link>
          </div>
        )}

        {/* Biodata Pelanggan */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-5">
             <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
             </div>
             <h3 className="font-bold text-gray-900 text-lg">Informasi Pemesan & Pengambilan</h3>
          </div>
          
          <ProfileForm 
            initialNomorHp={dbUser?.nomor_hp || ""} 
            initialAddress={dbUser?.address || ""} 
          />
        </div>

        {/* Riwayat Pesanan (Placeholder) */}
        <div className="px-6 pb-8">
           <div className="border-t border-gray-100 pt-6 mt-2">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                   <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Riwayat Pesanan</h3>
             </div>
             
             <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">
                <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">Belum ada riwayat pesanan kue.</p>
                <p className="text-xs text-gray-400 mt-1">Pesanan Anda akan muncul di sini nanti.</p>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
