"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";

const sampleStock = [
  { id: "1", product: "Risol Segitiga", supplier: "MAS YANTO", stockIn: 50, currentStock: 25 },
  { id: "2", product: "Lapis", supplier: "MAS ARIS", stockIn: 30, currentStock: 30 },
  { id: "3", product: "Donat", supplier: "MAS YANTO", stockIn: 40, currentStock: 15 },
];

export default function StokPage() {
  const [stockEntries, setStockEntries] = useState(sampleStock);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const response = await fetch("/api/reset", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setStockEntries([]);
        alert("Data harian berhasil di-reset! Stok kembali ke 0.");
      }
    } catch (error) {
      console.error("Reset error:", error);
      alert("Gagal reset data");
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 hidden lg:block">Stok Harian</h1>
            <p className="text-sm text-gray-600 hidden lg:block">Input barang masuk setiap pagi</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Reset Harian
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl">
              <Plus className="w-5 h-5" />
              Input Stok Baru
            </button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Reset Data Harian?</h3>
                  <p className="text-sm text-gray-500">Semua penjualan dan stok hari ini akan dihapus.</p>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Data yang dihapus tidak dapat dikembalikan. Stok akan kembali ke 0.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isResetting ? "Mengreset..." : "Ya, Reset"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Today's Date */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-amber-600" />
            <div>
              <p className="text-sm text-gray-500">Tanggal Hari Ini</p>
              <p className="font-bold text-gray-900">
                {new Date().toLocaleDateString("id-ID", { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Barang Masuk</p>
            <p className="text-2xl font-bold text-green-600">
              {stockEntries.reduce((sum, entry) => sum + entry.stockIn, 0)} pcs
            </p>
          </div>
        </div>

        {/* Stock Entries */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Produk</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Supplier</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Barang Masuk</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Stok Sekarang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stockEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{entry.product}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{entry.supplier}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {entry.stockIn} pcs
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full font-medium ${
                        entry.currentStock <= 10 ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {entry.currentStock} pcs
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </Sidebar>
  );
}
