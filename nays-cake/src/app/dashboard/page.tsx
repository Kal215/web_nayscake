"use client";

import { motion } from "framer-motion";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/sidebar";

// Sample dashboard data
const stats = [
  { 
    title: "Total Produk", 
    value: "83", 
    icon: Package, 
    color: "from-blue-500 to-blue-600",
    change: "+5 bulan ini"
  },
  { 
    title: "Total Supplier", 
    value: "29", 
    icon: Users, 
    color: "from-purple-500 to-purple-600",
    change: "Aktif semua"
  },
  { 
    title: "Omzet Hari Ini", 
    value: "Rp 450.000", 
    icon: DollarSign, 
    color: "from-green-500 to-green-600",
    change: "+12% dari kemarin"
  },
  { 
    title: "Keuntungan", 
    value: "Rp 95.000", 
    icon: TrendingUp, 
    color: "from-amber-500 to-orange-600",
    change: "+8% dari kemarin"
  },
];

const lowStockItems = [
  { name: "Risol Segitiga", stock: 5, supplier: "MAS YANTO" },
  { name: "Lapis", stock: 3, supplier: "MAS ARIS" },
  { name: "Donat", stock: 8, supplier: "MAS YANTO" },
];

const topProducts = [
  { name: "Risol Segitiga", sold: 45, revenue: "Rp 45.000" },
  { name: "Lapis", sold: 38, revenue: "Rp 57.000" },
  { name: "Donat", sold: 35, revenue: "Rp 35.000" },
  { name: "Bolu Panggang", sold: 30, revenue: "Rp 45.000" },
];

export default function DashboardPage() {
  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 hidden lg:block">Dashboard</h1>
          <p className="text-sm text-gray-600 hidden lg:block">Selamat datang di Nay's Cake</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link 
            href="/dashboard/stok"
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Input Stok</span>
          </Link>
          <Link 
            href="/dashboard/penjualan"
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Penjualan</span>
          </Link>
          <Link 
            href="/dashboard/products"
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Produk</span>
          </Link>
          <Link 
            href="/dashboard/laporan"
            className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Laporan</span>
          </Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Low Stock Alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Stok Sedikit
              </h2>
              <Link href="/dashboard/stok" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.supplier}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-medium rounded-full">
                    {item.stock} pcs
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Produk Terlaris</h2>
              <Link href="/dashboard/laporan" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                V laporan <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sold} terjual</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">{product.revenue}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Menu Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Menu Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/products" className="p-4 border border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Produk</span>
            </Link>
            <Link href="/dashboard/supplier" className="p-4 border border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Supplier</span>
            </Link>
            <Link href="/dashboard/stok" className="p-4 border border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Stok Harian</span>
            </Link>
            <Link href="/dashboard/penjualan" className="p-4 border border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all text-center">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Penjualan</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </Sidebar>
  );
}
