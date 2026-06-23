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
              Lebih dari Sekadar <span className="text-amber-600">Kue Basah</span>
            </h2>
            <div className="space-y-6 text-gray-600">
              <p className="text-lg leading-relaxed">
                Dari lemper, risoles, pastel, hingga aneka bolu dan puding, Nay's Cake menghadirkan beragam pilihan makanan ringan berkualitas untuk menemani setiap momen. Diproduksi setiap hari dan dipasok oleh mitra terpercaya untuk menjaga kesegaran serta cita rasa terbaik.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
                {[
                  { icon: "🌿", title: "Selalu Fresh", desc: "Diproduksi dan dikirim setiap hari" },
                  { icon: "🤝", title: "Supplier Pilihan", desc: "Bermitra dengan puluhan supplier terpercaya" },
                  { icon: "🚚", title: "Siap untuk Berbagai Acara", desc: "Arisan, rapat, syukuran, ulang tahun, dan lainnya" },
                  { icon: "💯", title: "Kualitas Terjaga", desc: "Produk diseleksi sebelum sampai ke pelanggan" },
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
