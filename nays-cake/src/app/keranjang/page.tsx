"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useCartStore } from "@/store/cartStore";
import { getDbUserForCheckout, createDraftOrder } from "./actions";

export default function KeranjangPage() {
  const [mounted, setMounted] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);
  const { user, isSignedIn, isLoaded } = useUser();
  const clerk = useClerk();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zustand Store
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    if (isSignedIn) {
      getDbUserForCheckout().then(data => setDbUser(data));
    }
  }, [isSignedIn]);

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!isLoaded) return;
    if (!isSignedIn) {
      clerk.openSignIn();
      return;
    }

    const nama = user?.fullName || user?.firstName || "Pelanggan Setia";
    const email = user?.primaryEmailAddress?.emailAddress || "Tidak ada email";
    const nomorHp = dbUser?.nomor_hp || "Belum diisi (Mohon lengkapi di profil)";
    const alamat = dbUser?.address || "Belum diisi (Mohon lengkapi di profil)";
    const metodeAmbil = dbUser?.metode_ambil || "Belum diisi (Mohon lengkapi di profil)";
    const infoPelanggan = `*Data Pelanggan:*%0A👤 Nama: ${nama}%0A📧 Email: ${email}%0A📞 No. HP: ${nomorHp}%0A📍 Alamat: %0A🛍️ Metode Ambil: ${metodeAmbil}`;

    const pesan = cartItems.map((i) => `▪ ${i.quantity}x ${i.name}`).join('%0A');
    const teks = `Halo Asisten AI Nay's Cake! 🎂%0A%0ASaya ingin *Checkout* pesanan dari Website:%0A${pesan}%0A%0A${infoPelanggan}%0A%0A*Estimasi Total: Rp${total.toLocaleString("id-ID")}*%0A%0AMohon segera diproses dan kirimkan total tagihannya ya!`;
    const nomorBot = "6281222133727";
    
    // Perbaikan Webview Android APK
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    // Menggunakan Universal Link mutakhir (wa.me) agar lolos blokir Webview HP & Safari
    const waUrl = isMobile 
      ? `https://wa.me/${nomorBot}?text=${teks}`
      : `https://api.whatsapp.com/send?phone=${nomorBot}&text=${teks}`;
      
    if (isMobile) {
      window.location.href = waUrl;
    } else {
      window.open(waUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/catalog" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-500" />
            Keranjang Belanja
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Keranjang masih kosong</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Yuk, jelajahi katalog kami dan temukan kue kesukaanmu!</p>
            <Link href="/catalog" className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors">
              Lihat Katalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4">
                {cartItems.map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-amber-600 font-bold mb-3">Rp {item.price.toLocaleString("id-ID")}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-sm">
                          <button onClick={() => item.quantity <= 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"><Minus className="w-4 h-4"/></button>
                          <span className="font-bold text-sm w-6 text-center text-gray-700">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"><Plus className="w-4 h-4"/></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Total Item</span>
                  <span className="font-medium">{cartItems.reduce((a, b) => a + b.quantity, 0)} Porsi</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
                  <span>Total Harga</span>
                  <span className="text-amber-600">Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <button onClick={handleCheckout} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 active:scale-[0.98]">
                {isSubmitting ? 'Memproses...' : <><MessageCircle className="w-6 h-6"/> Pesan Sekarang via WhatsApp</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
