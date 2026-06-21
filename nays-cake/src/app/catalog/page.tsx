"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Filter, MessageCircle, Package, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  sellingPrice: number;
  costPrice: number;
  category: string;
  supplier: string;
  supplierId: string;
  stock: number;
  minStock: number;
  isAvailable: boolean;
  imageUrl: string | null;
}

interface ProductsResponse {
  products: Product[];
  categories: string[];
  suppliers: string[];
  total: number;
}

const categoryDisplay: Record<string, { emoji: string; label: string }> = {
  "Lemper & Bacang": { emoji: "🥟", label: "Lemper & Bacang" },
  "Kue Basah": { emoji: "🎂", label: "Kue Basah" },
  "Jajanan Tradisional": { emoji: "🍩", label: "Jajanan Tradisional" },
  "Roti & Bolen": { emoji: "🥐", label: "Roti & Bolen" },
  "Bolu & Cake": { emoji: "🎂", label: "Bolu & Cake" },
  "Puding & Dessert": { emoji: "🍮", label: "Puding & Dessert" },
  "Donat & Pastry": { emoji: "🍩", label: "Donat & Pastry" },
  "Gorengan & Snack Asin": { emoji: "🥟", label: "Gorengan & Snack Asin" },
  "Menu Spesial": { emoji: "🍕", label: "Menu Spesial" },
};

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([500, 15000]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerBlur = useTransform(scrollY, [0, 100], [0, 8]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [search, selectedCategory, selectedSupplier, priceRange, allProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      const data: ProductsResponse = await response.json();
      setAllProducts(data.products);
      setCategories(data.categories);
      setSuppliers(data.suppliers);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...allProducts];

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.supplier.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedSupplier) {
      filtered = filtered.filter((p) => p.supplier === selectedSupplier);
    }

    filtered = filtered.filter(
      (p) => p.sellingPrice >= priceRange[0] && p.sellingPrice <= priceRange[1]
    );

    filtered.sort((a, b) => a.sellingPrice - b.sellingPrice);

    setProducts(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Habis", class: "bg-red-500 text-white" };
    if (stock <= minStock) return { label: "Stok Sedikit", class: "bg-yellow-500 text-white" };
    return { label: "Tersedia", class: "bg-green-500 text-white" };
  };

  const getCategoryDisplay = (category: string) => {
    return categoryDisplay[category] || { emoji: "🍽️", label: category };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Sticky Header with Scroll Effect */}
      <motion.header
        ref={headerRef}
        style={{
          opacity: headerOpacity,
          backdropFilter: `blur(${headerBlur}px)`,
        }}
        className="bg-white/80 sticky top-0 z-50 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button & Title */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali</span>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Katalog Produk
              </h1>
              <p className="text-sm text-gray-600 hidden sm:block">
                Pilihan kue basah segar dan berkualitas dari supplier terpercaya
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white min-w-[220px]"
              >
                <option value="">🍽️ Semua Produk</option>
                {categories.map((cat) => {
                  const display = getCategoryDisplay(cat);
                  return (
                    <option key={cat} value={cat}>
                      {display.emoji} {display.label}
                    </option>
                  );
                })}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white min-w-[150px]"
              >
                <option value="">Semua Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup} value={sup}>
                    {sup}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                💰 Harga: Rp {priceRange[0].toLocaleString("id-ID")} - Rp {priceRange[1].toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex gap-4 items-center">
              <input
                type="range"
                min="500"
                max="15000"
                step="500"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([Number(e.target.value), priceRange[1]])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <input
                type="range"
                min="500"
                max="15000"
                step="500"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Rp 500</span>
              <span>Rp 15.000</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-4 text-sm text-gray-600">
              Menampilkan {products.length} produk
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map((product, index) => {
                const stockStatus = getStockStatus(product.stock, product.minStock);
                const categoryDisplay_ = getCategoryDisplay(product.category);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-6xl">🎂</span>
                        </div>
                      )}

                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${stockStatus.class}`}>
                          {stockStatus.label}
                        </span>
                      </div>

                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 text-xs font-medium bg-white/90 text-gray-700 rounded-full">
                          {categoryDisplay_.emoji} {categoryDisplay_.label}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{product.supplier}</p>
                      <div className="text-2xl font-bold text-amber-600 mb-1">
                        Rp {product.sellingPrice.toLocaleString("id-ID")}
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        Modal: Rp {product.costPrice.toLocaleString("id-ID")}
                      </p>

                      <a
                        href={`https://wa.me/6281234567890?text=Halo,%20saya%20mau%20pesan%20${encodeURIComponent(product.name)}%20dari%20${encodeURIComponent(product.supplier)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${
                          product.isAvailable
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:shadow-green-500/30"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        {product.isAvailable ? "Pesan via WhatsApp" : "Stok Habis"}
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? "bg-amber-500 text-white shadow"
                        : "bg-white shadow hover:shadow-md"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
