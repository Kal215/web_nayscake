"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Plus, 
  Calendar, 
  RefreshCw, 
  AlertCircle,
  X,
  Search,
  TrendingUp,
  DollarSign,
  Users,
  Check,
  Loader2
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TombolKembali } from "@/components/dashboard/TombolKembali";

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  costPrice: number;
  supplier: string;
  supplierId: string;
  category?: string;
  stock?: number;
}

interface StockRow {
  id: string;
  productId: string;
  nama: string;
  supplier: string;
  supplierId: string;
  hargaJual: number;
  modal: number;
  masuk: number;
  sisa: number | null;
  terjual: number | null;
  omzet: number | null;
  setoran: number | null;
  laba: number | null;
  sudahSelesai: boolean;
}

interface Ringkasan {
  totalMasuk: number;
  totalTerjual: number;
  totalOmzet: number;
  totalModal: number;
  totalLaba: number;
  jumlahEntry: number;
  belumIsiSisa: number;
}

interface SetoranPemasok {
  nama: string;
  setoran: number;
  laba: number;
  terjual: number;
}

interface StockData {
  tanggal: string;
  rows: StockRow[];
  ringkasan: Ringkasan;
  setoranPemasok: SetoranPemasok[];
}

function formatRupiah(num: number): string {
  return num.toLocaleString("id-ID");
}

export default function StokPage() {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Input barang masuk state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityIn, setQuantityIn] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Sisa input state
  const [editingSisa, setEditingSisa] = useState<string | null>(null);
  const [sisaValue, setSisaValue] = useState("");
  const [submittingSisa, setSubmittingSisa] = useState(false);

  const fetchStockData = useCallback(async () => {
    try {
      const res = await fetch("/api/stock");
      const data = await res.json();
      setStockData(data);
    } catch (error) {
      console.error("Failed to fetch stock data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }, []);

  useEffect(() => {
    fetchStockData();
    fetchProducts();
  }, [fetchStockData, fetchProducts]);

  const handleInputStock = async () => {
    if (!selectedProduct || !quantityIn || parseInt(quantityIn) <= 0) {
      alert("Pilih produk dan masukkan jumlah yang valid");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantityIn: parseInt(quantityIn),
          notes: notes || undefined,
        }),
      });
      
      if (res.ok) {
        setShowInputModal(false);
        setSelectedProduct(null);
        setQuantityIn("");
        setNotes("");
        setSearchTerm("");
        fetchStockData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSisa = async (entryId: string) => {
    const sisa = parseInt(sisaValue);
    if (isNaN(sisa) || sisa < 0) {
      alert("Masukkan jumlah sisa yang valid");
      return;
    }

    setSubmittingSisa(true);
    try {
      const res = await fetch("/api/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entryId,
          quantityRemaining: sisa,
        }),
      });
      
      if (res.ok) {
        setEditingSisa(null);
        setSisaValue("");
        fetchStockData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan sisa");
      }
    } catch (error) {
      console.error("Save sisa error:", error);
      alert("Terjadi kesalahan");
    } finally {
      setSubmittingSisa(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      // Delete all stock entries for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await fetch("/api/stock", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today.toISOString() }),
      });
      
      fetchStockData();
    } catch (error) {
      console.error("Reset error:", error);
      alert("Gagal mereset data");
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.supplier.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  });

  // Get products that haven't been entered today
  const enteredProductIds = new Set(stockData?.rows.map((r) => r.productId) || []);
  const availableProducts = filteredProducts.filter((p) => !enteredProductIds.has(p.id));

  const today = new Date();

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto">
        <TombolKembali />
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 hidden lg:block">Stok Harian</h1>
            <p className="text-sm text-gray-600 hidden lg:block">
              Input barang masuk setiap pagi, isi sisa setiap sore
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Reset Harian
            </button>
            <button
              onClick={() => setShowInputModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Input Barang Masuk
            </button>
          </div>
        </div>

        {/* Today's Date */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-amber-600" />
            <div>
              <p className="text-sm text-gray-500">Tanggal Hari Ini</p>
              <p className="font-bold text-gray-900">
                {today.toLocaleDateString("id-ID", { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Masuk</p>
              <p className="text-xl font-bold text-green-600">
                {stockData?.ringkasan.totalMasuk || 0} pcs
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Belum Isi Sisa</p>
              <p className="text-xl font-bold text-yellow-600">
                {stockData?.ringkasan.belumIsiSisa || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-amber-500"
          >
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-gray-500">Terjual</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stockData?.ringkasan.totalTerjual || 0} pcs
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-green-500"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500">Omzet</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              Rp {formatRupiah(stockData?.ringkasan.totalOmzet || 0)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-blue-500"
          >
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500">Laba</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              Rp {formatRupiah(stockData?.ringkasan.totalLaba || 0)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-orange-500"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-500">Setoran</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              Rp {formatRupiah(stockData?.ringkasan.totalModal || 0)}
            </p>
          </motion.div>
        </div>

        {/* Stock Entries Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Produk</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Supplier</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Harga Jual</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Modal</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Masuk</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Sisa</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Terjual</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Omzet</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Laba</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(!stockData?.rows || stockData.rows.length === 0) ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      Belum ada data stok hari ini. Klik "Input Barang Masuk" untuk memulai.
                    </td>
                  </tr>
                ) : (
                  stockData.rows.map((row) => (
                    <tr key={row.id} className={`hover:bg-gray-50 ${!row.sudahSelesai ? 'bg-yellow-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-amber-600" />
                          <span className="font-medium text-gray-900">{row.nama}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.supplier}</td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        Rp {formatRupiah(row.hargaJual)}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        Rp {formatRupiah(row.modal)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                          {row.masuk} pcs
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editingSisa === row.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              value={sisaValue}
                              onChange={(e) => setSisaValue(e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center"
                              min="0"
                              max={row.masuk}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveSisa(row.id)}
                              disabled={submittingSisa}
                              className="p-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingSisa(null);
                                setSisaValue("");
                              }}
                              className="p-1 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingSisa(row.id);
                              setSisaValue(row.sisa?.toString() || "");
                            }}
                            className={`px-3 py-1 rounded-full font-medium ${
                              row.sisa === null
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                          >
                            {row.sisa === null ? "Klik isi sisa" : `${row.sisa} pcs`}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.terjual !== null ? (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                            {row.terjual} pcs
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.omzet !== null ? (
                          <span className="text-green-600 font-medium">
                            Rp {formatRupiah(row.omzet)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.laba !== null ? (
                          <span className={`font-medium ${
                            row.laba >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            Rp {formatRupiah(row.laba)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Setoran to Suppliers */}
        {stockData?.setoranPemasok && stockData.setoranPemasok.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              Setoran ke Pemasok
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stockData.setoranPemasok.map((pemasok, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">{pemasok.nama}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Terjual:</span>
                      <span className="font-medium">{pemasok.terjual} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Setoran:</span>
                      <span className="font-medium text-orange-600">
                        Rp {formatRupiah(pemasok.setoran)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Laba:</span>
                      <span className="font-medium text-green-600">
                        Rp {formatRupiah(pemasok.laba)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Modal */}
      <AnimatePresence>
        {showInputModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Input Barang Masuk</h3>
                <button
                  onClick={() => {
                    setShowInputModal(false);
                    setSelectedProduct(null);
                    setSearchTerm("");
                    setQuantityIn("");
                    setNotes("");
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Produk
                </label>
                {selectedProduct ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
                        <p className="text-sm text-gray-600">{selectedProduct.supplier}</p>
                        <p className="text-sm text-gray-500">
                          Jual: Rp {formatRupiah(selectedProduct.sellingPrice)} | 
                          Modal: Rp {formatRupiah(selectedProduct.costPrice)}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="text-amber-600 hover:text-amber-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari produk..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                      {availableProducts.length === 0 ? (
                        <p className="p-4 text-center text-gray-500">
                          {searchTerm ? "Produk tidak ditemukan" : "Semua produk sudah diinput hari ini"}
                        </p>
                      ) : (
                        availableProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => setSelectedProduct(product)}
                            className="w-full p-4 text-left hover:bg-gray-50 border-b last:border-b-0"
                          >
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.supplier}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Quantity Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Masuk (pcs)
                </label>
                <input
                  type="number"
                  value={quantityIn}
                  onChange={(e) => setQuantityIn(e.target.value)}
                  placeholder="Masukkan jumlah"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleInputStock}
                disabled={!selectedProduct || !quantityIn || submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Simpan Barang Masuk
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Reset Data Harian?</h3>
                  <p className="text-sm text-gray-500">Semua entry stok hari ini akan dihapus.</p>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Data yang dihapus tidak dapat dikembalikan.
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
      </AnimatePresence>
    </Sidebar>
  );
}
