"use client";

import { motion } from "framer-motion";

export function AboutSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-8xl">🎂</span>
                  <p className="text-amber-600 font-semibold mt-4">Fresh Every Day</p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-amber-200 rounded-2xl -z-10" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-200 rounded-2xl -z-10" />
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-amber-600 font-semibold tracking-wide uppercase text-sm">
              Tentang Kami
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Kue Segar Langsung dari <span className="text-amber-600">Supplier Terpercaya</span>
            </h2>
            <div className="space-y-6 text-gray-600">
              <p className="text-lg leading-relaxed">
                Nay's Cake hadir untuk memberikan pilihan kue basah segar dan berkualitas untuk setiap momen spesial Anda. Dengan lebih dari 77 varian kue dari 29 supplier terpercaya, kami memastikan setiap produk Fresh dari supplier langsung ke meja Anda.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
                {[
                  { icon: "🌿", title: "Bahan Segar", desc: "Langsung dari supplier setiap pagi" },
                  { icon: "🤝", title: "Supplier Terpercaya", desc: "29 supplier berpengalaman" },
                  { icon: "⏰", title: "Fresh Every Day", desc: "Diproduksi setiap hari" },
                  { icon: "💯", title: "Kualitas terjamin", desc: "Seleksi ketat sebelum jual" },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
