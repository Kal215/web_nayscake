"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, MessageCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="neo-hero relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        {/* Menggunakan img tag untuk auto-refresh saat file di public berubah */}
        <img
          src="/gambar.jpg"
          alt="Nay's Cake Background"
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient untuk readability - lebih transparan */}
        <div className="neo-hero-overlay absolute inset-0 bg-gradient-to-br from-amber-50/70 via-white/60 to-orange-50/70" />
      </div>

      {/* Animated Background Elements (di atas gambar) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Decorative circles */}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-amber-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Toko Aneka Jajanan & Kue Basah</span>
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 tracking-tight"
        >
          <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            Nay's Cake
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed"
        >
          Sajian Lezat untuk Setiap Momen Anda
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-base sm:text-lg text-gray-500 mb-10 max-w-xl mx-auto"
        >
          Puluhan pilihan kue tradisional dan modern dengan kualitas terbaik, dikirim langsung dari supplier terpercaya setiap hari.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/catalog"
            className="neo-action neo-action--primary group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full shadow-xl hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Lihat Katalog</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="https://wa.me/6285126023250"
            target="_blank"
            rel="noopener noreferrer"
            className="neo-action flex items-center gap-3 px-8 py-4 bg-white text-gray-800 font-semibold rounded-full shadow-lg hover:shadow-xl border border-gray-200 hover:border-amber-300 transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="w-5 h-5 text-green-500" />
            <span>Pesan Sekarang</span>
          </a>
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-12"
        >
          {[
            { number: "77+", label: "Produk" },
            { number: "29+", label: "Supplier" },
            { number: "1000+", label: "Pelanggan" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                {stat.number}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-xs font-medium">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
