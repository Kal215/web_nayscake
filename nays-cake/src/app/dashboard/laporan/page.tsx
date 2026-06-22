"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Calendar, Download, TrendingUp } from "lucide-react";
import { TombolKembali } from "@/components/dashboard/TombolKembali";

const sampleData = [
  { date: "Senin", sales: 450000, profit: 95000 },
  { date: "Selasa", sales: 520000, profit: 110000 },
  { date: "Rabu", sales: 380000, profit: 80000 },
  { date: "Kamis", sales: 610000, profit: 130000 },
  { date: "Jumat", sales: 750000, profit: 160000 },
  { date: "Sabtu", sales: 920000, profit: 195000 },
  { date: "Minggu", sales: 850000, profit: 180000 },
];

const topProducts = [
  { name: "Risol Segitiga", sold: 320, revenue: 320000 },
  { name: "Lapis", sold: 280, revenue: 420000 },
  { name: "Donat", sold: 250, revenue: 250000 },
  { name: "Bolu Panggang", sold: 220, revenue: 330000 },
];

export default function LaporanPage() {
  const [period, setPeriod] = useState("weekly");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <TombolKembali />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
              <p className="text-sm text-gray-600">Analisis penjualan dan keuntungan</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-xl">
              <Download className="w-5 h-5" /> Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setPeriod("daily")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${period === "daily" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Harian
            </button>
            <button
              onClick={() => setPeriod("weekly")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${period === "weekly" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${period === "monthly" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Bulanan
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Penjualan</p>
                <p className="text-2xl font-bold text-gray-900">Rp 4.480.000</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <BarChart className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Keuntungan</p>
                <p className="text-2xl font-bold text-gray-900">Rp 950.000</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rata-rata Harian</p>
                <p className="text-2xl font-bold text-gray-900">Rp 640.000</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sales Chart Placeholder */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold mb-4">Grafik Penjualan 7 Hari Terakhir</h2>
          <div className="h-64 flex items-end justify-around gap-2">
            {sampleData.map((day, index) => (
              <div key={day.date} className="flex flex-col items-center gap-2">
                <div 
                  className="w-full max-w-12 bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-lg"
                  style={{ height: `${(day.sales / 1000000) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{day.date}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Produk Terlaris Minggu Ini</h2>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sold} terjual</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">Rp {product.revenue.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}