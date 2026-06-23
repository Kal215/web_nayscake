"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
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
  suppliers: { id: string; name: string }[];
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
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([500, 15000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const itemsPerPage = 12;

  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll tracking for parallax sidebar - only initialize after mount
  const { scrollYProgress } = useScroll();
  
  // Parallax effect for sidebar - moves slower than scroll
  const sidebarY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const smoothSidebarY = useSpring(sidebarY, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: parallaxProgress } = useScroll({
    target: parallaxRef,
    offset: ["start start", "end start"]
  });

  const springOptions = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothY = useSpring(parallaxProgress, springOptions);

  const heroY = useTransform(smoothY, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(smoothY, [0, 0.8], [1, 0]);
  const heroScale = useTransform(smoothY, [0, 0.5], [1, 1.1]);

  const bgElement1Y = useTransform(smoothY, [0, 1], ["0%", "50%"]);
  const bgElement2Y = useTransform(smoothY, [0, 1], ["0%", "70%"]);
  const bgElement3Y = useTransform(smoothY, [0, 1], ["0%", "40%"]);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  useEffect(() => { filterAndSortProducts(); }, [search, selectedCategory, selectedSupplier, priceRange, allProducts]);

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
    if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.supplier.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategory) filtered = filtered.filter((p) => p.category === selectedCategory);
    if (selectedSupplier) filtered = filtered.filter((p) => p.supplier === selectedSupplier);
    filtered = filtered.filter((p) => p.sellingPrice >= priceRange[0] && p.sellingPrice <= priceRange[1]);
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

  const getCategoryDisplay = (category: string) => categoryDisplay[category] || { emoji: "🍽️", label: category };

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar - Parallax Following */}
      <motion.aside 
        style={mounted ? { y: smoothSidebarY } : {}}
        className="w-full lg:w-80 xl:w-96 lg:fixed lg:top-0 lg:left-0 lg:h-screen p-4 sm:p-6 lg:py-8 lg:pl-8 lg:pr-4 z-40"
      >
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-4 sm:p-6">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full transition-colors text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /><span>Kembali</span>
          </Link>
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Katalog Produk</h1>
            <p className="text-xs text-gray-600 mt-1">Pilih kue basah segar berkualitas</p>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
            <div className="relative">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-xs appearance-none">
                <option value="">🍽️ Semua</option>
                {categories.map((cat) => {
                  const display = getCategoryDisplay(cat);
                  return <option key={cat} value={cat}>{display.emoji} {display.label}</option>;
                })}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
            <div className="relative">
              <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-xs appearance-none">
                <option value="">Semua</option>
                {suppliers.map((sup) => <option key={sup.id} value={sup.name}>{sup.name}</option>)}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">💰 Harga: Rp {priceRange[0].toLocaleString("id-ID")} - Rp {priceRange[1].toLocaleString("id-ID")}</label>
            <div className="space-y-2">
              <input type="range" min="500" max="15000" step="500" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
              <input type="range" min="500" max="15000" step="500" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
              <div className="flex justify-between text-[10px] text-gray-500"><span>Rp 500</span><span>Rp 15.000</span></div>
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl">
            <p className="text-xs text-gray-600">Menampilkan <span className="font-bold text-amber-600">{products.length}</span> produk</p>
          </div>
        </div>
      </motion.aside>

      {/* Products Area */}
      <main className="flex-1 lg:ml-80 xl:ml-96">
        {/* Parallax Header */}
        <div ref={parallaxRef} className="relative overflow-hidden">
          <img src="/catalog-bg.jpg" alt="Catalog Background" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 via-white/60 to-orange-50/70" />
          <motion.div style={{ y: bgElement1Y }} className="absolute -top-20 -left-20 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl animate-pulse" />
          <motion.div style={{ y: bgElement2Y }} className="absolute top-40 -right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse" />
          <motion.div style={{ y: bgElement3Y }} className="absolute top-80 left-1/3 w-[500px] h-[500px] bg-yellow-200/20 rounded-full blur-3xl" />
          <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative py-8 sm:py-12 md:py-16 text-center px-4">
            <motion.h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">Kue Masih Segar</span>
              <br className="hidden sm:block" />
              <span className="text-gray-700 text-xl sm:text-2xl md:text-3xl lg:text-4xl">Langsung dari Supplier</span>
            </motion.h2>
            <motion.p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
              Jelajahi berbagai pilihan kue basah, gorengan, dan jajanan tradisional berkualitas tinggi
            </motion.p>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="p-4 sm:p-6 lg:py-8 bg-gradient-to-b from-yellow-50/50 to-amber-50/50">
          {loading ? (
            <div className="flex items-center justify-center py-16 sm:py-20"><div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-amber-500 border-t-transparent"></div></div>
          ) : currentProducts.length === 0 ? (
            <div className="text-center py-16 sm:py-20"><Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Tidak ada produk ditemukan</p></div>
          ) : (
            <>
              <motion.div className="text-center mb-4 sm:mb-6 text-sm sm:text-base text-gray-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Menampilkan {products.length} produk</motion.div>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {currentProducts.map((product, index) => {
                  const stockStatus = getStockStatus(product.stock, product.minStock);
                  const catDisplay = getCategoryDisplay(product.category);
                  return (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }} whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(251, 146, 60, 0.3)" }} className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group">
                      <div className="relative aspect-[4/3] sm:aspect-square bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
                        {product.imageUrl ? (
                          <div className="relative w-full h-full"><Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" /></div>
                        ) : (
                          <div className="relative w-full h-full"><Image src="/gambar.jpg" alt="Kue Segar" fill className="object-cover" sizes="(max-width: 640px) 100vw" /></div>
                        )}
                        <motion.div className="absolute top-2 right-2 sm:top-3 sm:right-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.02 }}>
                          <span className={`px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-medium rounded-full ${stockStatus.class}`}>{stockStatus.label}</span>
                        </motion.div>
                        <motion.div className="absolute top-2 left-2 sm:top-3 sm:left-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.02 }}>
                          <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-medium bg-white/90 text-gray-700 rounded-full backdrop-blur-sm">{catDisplay.emoji} {catDisplay.label}</span>
                        </motion.div>
                        {product.isAvailable && (
                          <motion.div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                            <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full shadow-lg">✨ Tersedia</span>
                          </motion.div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4 md:p-5">
                        <motion.h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-0.5 sm:mb-1 group-hover:text-amber-600 transition-colors line-clamp-1 sm:line-clamp-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{product.name}</motion.h3>
                        <motion.p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 line-clamp-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{product.supplier}</motion.p>
                        <motion.div className="text-lg sm:text-xl md:text-2xl font-bold text-amber-600 mb-1 sm:mb-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>Rp {product.sellingPrice.toLocaleString("id-ID")}</motion.div>
                        <motion.a href={`https://wa.me/6285126023250?text=Halo,%20saya%20mau%20pesan%20${encodeURIComponent(product.name)}%20dari%20${encodeURIComponent(product.supplier)}`} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 min-h-[44px] ${product.isAvailable ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" /><span>{product.isAvailable ? "Pesan via WhatsApp" : "Stok Habis"}</span>
                        </motion.a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <motion.div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1.5 sm:p-2 rounded-lg bg-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[36px] sm:min-w-[44px] min-h-[36px] sm:min-h-[44px] flex items-center justify-center"><ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /></motion.button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <motion.button key={page} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(page)} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-sm sm:text-base transition-all min-w-[32px] sm:min-w-[40px] flex items-center justify-center ${currentPage === page ? "bg-amber-500 text-white shadow" : "bg-white shadow hover:shadow-md"}`}>{page}</motion.button>
                  ))}
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-1.5 sm:p-2 rounded-lg bg-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[36px] sm:min-w-[44px] min-h-[36px] sm:min-h-[44px] flex items-center justify-center"><ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /></motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
