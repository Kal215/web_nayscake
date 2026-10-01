"use client";

import { useState } from "react";
import { saveProfile } from "./actions";

export default function ProfileForm({ initialNomorHp, initialAddress, initialMetodeAmbil }: { initialNomorHp: string, initialAddress: string, initialMetodeAmbil: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const formData = new FormData(e.currentTarget);
      await saveProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan profil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">Nomor WhatsApp</label>
        <input 
          type="text" 
          name="nomor_hp"
          defaultValue={initialNomorHp}
          placeholder="Contoh: 081234567890" 
          className="w-full bg-white border border-gray-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none rounded-xl p-3 text-sm text-gray-700 shadow-sm transition-all" 
        />
      </div>
      
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">Alamat Lengkap (Untuk Keamanan & Verifikasi)</label>
        <textarea 
          name="address"
          defaultValue={initialAddress}
          rows={2} 
          placeholder="Tuliskan alamat rumah/kantor untuk menghindari penipuan order..." 
          className="w-full bg-white border border-gray-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none rounded-xl p-3 text-sm text-gray-700 shadow-sm transition-all"
        ></textarea>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-700 mb-2 block">Metode Pengambilan Kue</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="relative cursor-pointer">
            <input 
              type="radio" 
              name="metode_ambil" 
              value="🏪 Ambil Sendiri ke Toko" 
              defaultChecked={!initialMetodeAmbil || initialMetodeAmbil.includes("Toko") || initialMetodeAmbil.includes("Ambil")}
              className="peer sr-only" 
            />
            <div className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:ring-1 peer-checked:ring-amber-500 transition-all text-center">
              <span className="block text-2xl mb-1">🏪</span>
              <span className="block text-sm font-bold text-gray-700">Ambil Sendiri</span>
              <span className="block text-[10px] text-gray-500 mt-1">Ke lokasi Nays Cake</span>
            </div>
          </label>
          
          <label className="relative cursor-pointer">
            <input 
              type="radio" 
              name="metode_ambil" 
              value="🛵 Dikirim via Kurir (Ojol)" 
              defaultChecked={initialMetodeAmbil.includes("Kurir") || initialMetodeAmbil.includes("Ojol") || initialMetodeAmbil.includes("GoSend")}
              className="peer sr-only" 
            />
            <div className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:ring-1 peer-checked:ring-amber-500 transition-all text-center">
              <span className="block text-2xl mb-1">🛵</span>
              <span className="block text-sm font-bold text-gray-700">Via Kurir (Ojol)</span>
              <span className="block text-[10px] text-gray-500 mt-1">GoSend / GrabExpress</span>
            </div>
          </label>
        </div>
      </div>

      
      <button 
        type="submit"
        disabled={loading}
        className={`w-full font-semibold py-4 rounded-xl mt-4 transition-all shadow-md ${
          loading 
          ? "bg-amber-200 text-amber-800 cursor-not-allowed" 
          : "bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:shadow-lg hover:-translate-y-0.5"
        }`}
      >
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>

      {success && (
        <div className="bg-green-50 text-green-600 text-xs font-medium text-center py-2 px-3 rounded-lg border border-green-100">
          ✅ Profil berhasil diperbarui!
        </div>
      )}
    </form>
  );
}
