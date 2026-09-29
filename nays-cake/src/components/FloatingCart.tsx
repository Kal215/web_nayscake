"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useCartStore } from "@/store/cartStore";

export default function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Zustand Store
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  // Zustand state needs to be loaded on client to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  const { user, isSignedIn, isLoaded } = useUser();
  const clerk = useClerk();

  useEffect(() => {
    setMounted(true);
    const handleAdd = () => setIsOpen(true);
    window.addEventListener("ADD_TO_CART", handleAdd);
    return () => window.removeEventListener("ADD_TO_CART", handleAdd);
  }, []);

  if (!mounted) return null;

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!isLoaded) return;
    if (!isSignedIn) {
      clerk.openSignIn(); 
      return; 
    }

    const nama = user?.fullName || user?.firstName || "Pelanggan Setia";
    const email = user?.primaryEmailAddress?.emailAddress || "Tidak ada email";
    const infoPelanggan = `*Data Pelanggan:*%0A👤 Nama: ${nama}%0A📧 Email: ${email}`;

    const pesan = cartItems.map((i) => `▪ ${i.quantity}x ${i.name}`).join('%0A');
    const teks = `Halo Asisten AI Nay's Cake! 🎂%0A%0ASaya ingin *Checkout* pesanan dari Website:%0A${pesan}%0A%0A${infoPelanggan}%0A%0A*Estimasi Total: Rp${total.toLocaleString("id-ID")}*%0A%0AMohon segera diproses dan kirimkan total tagihannya ya!`;
    const nomorBot = "6285703586056";
    
    // Perbaikan untuk Android WebView (APK)
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
    <>
      {/* Di Desktop/Laptop: Tampilkan Tombol Floating yang memanggil Drawer Laci */}
      <div className="hidden md:block">
        <motion.button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 bg-amber-600 text-white p-4 rounded-full shadow-2xl z-[90] flex items-center justify-center hover:bg-amber-700 transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
          </div>
        </motion.button>
      </div>
      
      {/* Drawer Laci Keranjang (Tampil secara Universal Jika isOpen true) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black z-[120]" />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.div key="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[130] flex flex-col">
              <div className="p-5 border-b flex items-center justify-between bg-amber-50">
                <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Keranjang Belanja</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-amber-100 rounded-full text-amber-700"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-amber-600 font-bold">Rp {item.price.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                      <button onClick={() => item.quantity <= 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)} className="p-1 text-gray-500 hover:text-gray-900"><Minus className="w-4 h-4"/></button>
                      <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-gray-500 hover:text-gray-900"><Plus className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t bg-gray-50 pb-24 lg:pb-5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-medium">Total Harga</span>
                  <span className="text-2xl font-bold text-amber-600">Rp {total.toLocaleString("id-ID")}</span>
                </div>
                <button onClick={handleCheckout} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform transform hover:scale-[1.02] active:scale-95 shadow-lg">
                  <MessageCircle className="w-5 h-5"/> Checkout via WhatsApp
                </button>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
