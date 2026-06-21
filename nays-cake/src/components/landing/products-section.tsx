"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  supplier?: string;
  imageUrl?: string | null;
}

interface ProductsSectionProps {
  initialProducts?: Product[];
}

const defaultProducts = [
  { id: "1", name: "Risol Segitiga", slug: "risol-segitiga", price: 1000, stock: 25, supplier: "MAS YANTO" },
  { id: "2", name: "Lapis", slug: "lapis", price: 1500, stock: 30, supplier: "MAS ARIS" },
  { id: "3", name: "Donat", slug: "donat", price: 1000, stock: 15, supplier: "MAS YANTO" },
  { id: "4", name: "Bolu Panggang", slug: "bolu-panggang", price: 1500, stock: 20, supplier: "MAS ARIS" },
];

export function ProductsSection({ initialProducts }: ProductsSectionProps) {
  const products = initialProducts && initialProducts.length > 0 ? initialProducts : defaultProducts;

  return (
    <section className="py-24 bg-gradient-to-b from-amber-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-amber-600 font-semibold tracking-wide uppercase text-sm">
            Koleksi Kami
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
            Produk <span className="text-amber-600">Unggulan</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pilihan kue basah favorit pelanggan kami yang selalu fresh dan berkualitas
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product, index) => {
            const isAvailable = product.stock > 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                {/* Image */}
                <div className="relative h-56 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-7xl">🎂</span>
                    </div>
                  )}
                  
                  {/* Stock Badge */}
                  <div className="absolute top-4 right-4">
                    {isAvailable ? (
                      <span className="px-3 py-1 text-xs font-semibold bg-green-500/90 text-white rounded-full backdrop-blur-sm">
                        Tersedia
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold bg-red-500/90 text-white rounded-full backdrop-blur-sm">
                        Habis
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{product.supplier}</p>
                  <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-4">
                    Rp {product.price.toLocaleString("id-ID")}
                  </div>
                  
                  <a
                    href={`https://wa.me/6281234567890?text=Halo,%20saya%20mau%20pesan%20${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isAvailable
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    {isAvailable ? "Pesan Sekarang" : "Stok Habis"}
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <a
            href="/catalog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Lihat Semua Produk
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
