import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default async function ProfilPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/"); // Soft-gate: usir ke beranda jika belum login
  }

  const primaryEmail = user.emailAddresses[0]?.emailAddress;
  const isAdmin = primaryEmail === "riskalfadhilla215@gmail.com";

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-12 pb-[100px]">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Profil */}
        <div className="bg-black px-6 py-10 text-center relative">
          <div className="absolute top-4 right-4 bg-white/20 p-1 rounded-full backdrop-blur-md">
            {/* Tombol Logout & Manage Clerk dipindah rapi ke sini */}
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          </div>
          <div className="w-20 h-20 bg-gray-200 rounded-full border-4 border-white mx-auto mb-3 overflow-hidden shadow-lg">
            <img src={user.imageUrl} alt="Profil" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {user.firstName ? `${user.firstName} ${user.lastName || ''}` : "Pengguna Nayscake"}
          </h2>
          <p className="text-gray-300 text-sm mt-1">{primaryEmail}</p>
          {isAdmin && (
            <span className="inline-block mt-3 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Admin / Kasir
            </span>
          )}
        </div>

        {/* Biodata Pelanggan */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Data Diri (Segera Hadir)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nomor WhatsApp</label>
              <input disabled type="text" placeholder="Belum diatur" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Alamat Pengiriman Utama</label>
              <textarea disabled rows={3} placeholder="Belum diatur" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700"></textarea>
            </div>
            
            <button disabled className="w-full bg-gray-200 text-gray-400 font-semibold py-4 rounded-xl mt-4">
              Simpan Perubahan
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              Fitur Biodata sedang dalam pengembangan *Enterprise*.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
