"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string | null;
  stock: number;
  index: number;
}

export function ProductCard({ id, name, slug, price, imageUrl, stock, index }: ProductCardProps) {
  const isAvailable = stock > 0;
  const isLowStock = stock > 0 && stock <= 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">
            🎂
          </div>
        )}
        
        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            isLowStock ? (
              <span className="px-3 py-1 text-xs font-medium bg-yellow-500 text-white rounded-full">
                Stok Sedikit
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
                Tersedia
              </span>
            )
          ) : (
            <span className="px-3 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
              Habis
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
          {name}
        </h3>
        <div className="text-2xl font-bold text-amber-600 mb-4">
          Rp {price.toLocaleString("id-ID")}
        </div>
        
        <a
          href={`https://wa.me/6281234567890?text=Halo,%20saya%20mau%20pesan%20${encodeURIComponent(name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${
            isAvailable
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/30"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          {isAvailable ? "Pesan via WhatsApp" : "Stok Habis"}
        </a>
      </div>
    </motion.div>
  );
}