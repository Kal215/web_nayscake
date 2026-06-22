"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, Loader2, Calendar, TrendingUp } from "lucide-react";
import { TombolKembali } from "@/components/dashboard/TombolKembali";

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  costPrice: number;
  category: string | null;
  supplier: { name: string };
}

interface Sale {
  id: string;
  saleDate: string;
  totalAmount: string;
  totalProfit: string;
  _count: { items: number };
}

export default function PenjualanPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, salesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/sales?limit=10")
      ]);
      const productsData = await productsRes.json();
      const salesData = await salesRes.json();
      setProducts(productsData.products || []);
      setRecentSales(salesData.sales || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      if (prev[id] <= 1) {
        const newCart = { ...prev };
        delete newCart[id];
        return newCart;
      }
      return { ...prev, [id]: prev[id] - 1 };
    });
  };

  const clearCart = () => setCart({});

  const cartProducts = products.filter(p => cart[p.id]);
  const totalAmount = cartProducts.reduce((sum, p) => sum + (Number(p.sellingPrice) * (cart[p.id] || 0)), 0);
  const totalProfit = cartProducts.reduce((sum, p) => sum + ((Number(p.sellingPrice) - Number(p.costPrice)) * (cart[p.id] || 0)), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <TombolKembali />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transaksi Penjualan</h1>
              <p className="text-sm text-gray-600">Catat penjualan harian</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product List */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Pilih Produk ({products.length} produk)</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="p-4 border rounded-xl hover:border-amber-500 transition-colors cursor-pointer" onClick={() => addToCart(product.id)}>
                    <div className="flex flex-col mb-2">
                      <span className="font-medium text-sm">{product.name}</span>
                      <span className="text-xs text-gray-500">{product.supplier.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-600 text-sm">Rp {Number(product.sellingPrice).toLocaleString("id-ID")}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
                        className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Cart & Recent Sales */}
          <div className="space-y-6">
            {/* Cart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-amber-600" />
                  <h2 className="text-lg font-bold">Keranjang</h2>
                </div>
                {Object.keys(cart).length > 0 && (
                  <button onClick={clearCart} className="text-red-500 text-sm hover:underline">
                    Hapus Semua
                  </button>
                )}
              </div>

              {Object.keys(cart).length === 0 ? (
                <p className="text-gray-500 text-center py-8">Keranjang kosong</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cartProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">Rp {Number(product.sellingPrice).toLocaleString("id-ID")} x {cart[product.id]}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeFromCart(product.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold w-8 text-center">{cart[product.id]}</span>
                          <button onClick={() => addToCart(product.id)} className="p-1 text-green-500 hover:bg-green-50 rounded">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Penjualan</span>
                      <span className="font-bold text-green-600">Rp {totalAmount.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Keuntungan</span>
                      <span className="font-medium text-amber-600">Rp {totalProfit.toLocaleString("id-ID")}</span>
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg mt-2">
                      Simpan Transaksi
                    </button>
                  </div>
                </>
              )}
            </motion.div>

            {/* Recent Sales */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold">Penjualan Terakhir</h2>
              </div>
              {recentSales.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Belum ada penjualan</p>
              ) : (
                <div className="space-y-3">
                  {recentSales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">{new Date(sale.saleDate).toLocaleDateString("id-ID")}</p>
                          <p className="text-xs text-gray-500">{sale._count.items} item</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">Rp {Number(sale.totalAmount).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
