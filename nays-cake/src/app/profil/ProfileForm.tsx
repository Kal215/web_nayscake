"use client";

import { useState } from "react";
import { saveProfile } from "./actions";

export default function ProfileForm({ initialWhatsapp, initialAddress }: { initialWhatsapp: string, initialAddress: string }) {
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
          name="whatsapp"
          defaultValue={initialWhatsapp}
          placeholder="Contoh: 081234567890" 
          className="w-full bg-white border border-gray-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none rounded-xl p-3 text-sm text-gray-700 shadow-sm transition-all" 
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">Alamat Pengiriman Utama</label>
        <textarea 
          name="address"
          defaultValue={initialAddress}
          rows={3} 
          placeholder="Tuliskan alamat lengkap rumah/kantor untuk pengiriman..." 
          className="w-full bg-white border border-gray-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none rounded-xl p-3 text-sm text-gray-700 shadow-sm transition-all"
        ></textarea>
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
