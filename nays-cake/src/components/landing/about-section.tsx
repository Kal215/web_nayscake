"use client";

import { motion } from "framer-motion";

export function AboutSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative">
              {/* Menggunakan img tag untuk auto-refresh saat file di public berubah */}
              <img
                src="/b.jpeg"
                alt="Fresh Every Day"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 sm:w-24 sm:h-24 bg-amber-200 rounded-2xl -z-10" />
            <div className="absolute -bottom-4 -right-4 w-28 h-28 sm:w-32 sm:h-32 bg-orange-200 rounded-2xl -z-10" />
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
