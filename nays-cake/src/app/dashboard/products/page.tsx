"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, ImagePlus, X, Save } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  category: string | null;
  costPrice: number;
  sellingPrice: number;
  supplier: { name: string };
  supplierId: string;
  imageUrl: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    costPrice: "",
    sellingPrice: "",
    category: "",
    supplierId: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
      setSuppliers(data.suppliers || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      costPrice: "",
      sellingPrice: "",
      category: "",
      supplierId: suppliers[0]?.id || "",
      imageUrl: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      category: product.category || "",
      supplierId: product.supplierId,
      imageUrl: product.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert("Gagal menghapus produk");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          costPrice: Number(formData.costPrice),
          sellingPrice: Number(formData.sellingPrice),
          category: formData.category,
          supplierId: formData.supplierId,
          imageUrl: formData.imageUrl,
        }),
      });

      if (res.ok) {
        await fetchProducts();
        setIsModalOpen(false);
      } else {
        const err = await res.json();
        alert(`Gagal menyimpan: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
              <p className="text-sm text-gray-600">Total {products.length} produk</p>
            </div>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah Produk
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk atau supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {paginatedProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Tidak ada produk ditemukan</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Produk</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Supplier</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kategori</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Modal</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Jual</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center overflow-hidden relative shadow-sm border border-amber-100">
                            {product.imageUrl ? (
                              <Image 
                                src={product.imageUrl} 
                                alt={product.name} 
                                fill 
                                className="object-cover" 
                              />
                            ) : (
                              <Package className="w-6 h-6 text-amber-400" />
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{product.supplier.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          {product.category || "Tanpa Kategori"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        Rp {Number(product.costPrice).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-amber-600">
                        Rp {Number(product.sellingPrice).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openEditModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Produk"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} dari {filteredProducts.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 bg-amber-50 text-amber-800 rounded-lg font-medium border border-amber-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Produk" : "Tambah Produk Baru"}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Upload Area */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center">
                    <CldUploadWidget 
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"} 
                      onSuccess={(result: any) => {
                        setFormData({ ...formData, imageUrl: result.info.secure_url });
                      }}
                    >
                      {({ open }) => {
                        return (
                          <div 
                            onClick={() => open()}
                            className="w-full max-w-xs aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-amber-500 hover:bg-amber-50 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden group"
                          >
                            {formData.imageUrl ? (
                              <>
                                <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white font-medium flex items-center gap-2">
                                    <ImagePlus className="w-5 h-5" /> Ganti Gambar
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                  <ImagePlus className="w-8 h-8" />
                                </div>
                                <span className="font-medium text-gray-600">Klik untuk Upload Gambar</span>
                                <span className="text-xs text-gray-400">JPG, PNG (Max 5MB)</span>
                              </>
                            )}
                          </div>
                        );
                      }}
                    </CldUploadWidget>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nama Produk</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Contoh: Lapis Legit"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Supplier</label>
                    <select
                      required
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    >
                      <option value="" disabled>Pilih Supplier</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Kategori</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Contoh: Kue Basah, Bolu"
                      list="categories-list"
                    />
                    <datalist id="categories-list">
                      {categories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>

                  <div className="space-y-2"></div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Harga Modal (Rp)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Harga Jual (Rp)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3 justify-end border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isSaving ? "Menyimpan..." : "Simpan Produk"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
