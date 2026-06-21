"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface CounterProps {
  end: number;
  suffix?: string;
  duration?: number;
}

function Counter({ end, suffix = "", duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className="font-bold">
      {count}{suffix}
    </span>
  );
}

interface Stats {
  products: number;
  suppliers: number;
  customers: number;
}

interface StatsSectionProps {
  stats?: Stats;
}

export function StatsSection({ stats }: StatsSectionProps) {
  const defaultStats = {
    products: 77,
    suppliers: 29,
    customers: 1000,
  };

  const displayStats = stats || defaultStats;

  return (
    <section className="py-20 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            className="text-center"
          >
            <div className="text-5xl md:text-6xl lg:text-7xl text-white mb-2">
              <Counter end={displayStats.products} suffix="+" />
            </div>
            <div className="text-xl md:text-2xl text-amber-100 font-medium">Produk</div>
            <div className="mt-2 text-amber-200 text-sm">Varian kue berkualitas</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center"
          >
            <div className="text-5xl md:text-6xl lg:text-7xl text-white mb-2">
              <Counter end={displayStats.suppliers} suffix="+" />
            </div>
            <div className="text-xl md:text-2xl text-amber-100 font-medium">Supplier</div>
            <div className="mt-2 text-amber-200 text-sm">Partner terpercaya</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <div className="text-5xl md:text-6xl lg:text-7xl text-white mb-2">
              <Counter end={displayStats.customers} suffix="+" />
            </div>
            <div className="text-xl md:text-2xl text-amber-100 font-medium">Pelanggan</div>
            <div className="mt-2 text-amber-200 text-sm">Pujaan kepercayaan</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
