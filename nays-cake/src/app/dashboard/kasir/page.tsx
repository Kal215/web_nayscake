'use client';
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function KasirNayscake() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for form
  const [inputs, setInputs] = useState<Record<string, { masuk: string, sisa: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [prodRes, stockRes] = await Promise.all([
        fetch('/api/products?internal=1'),
        fetch('/api/stock')
      ]);
      const prodData = await prodRes.json();
      const stockData = await stockRes.json();
      
      setProducts(prodData.products || []);
      setStocks(stockData.rows || []);
      
      // Initialize inputs mapping
      const initialInputs: Record<string, { masuk: string, sisa: string }> = {};
      prodData.products.forEach((p: any) => {
        const existing = (stockData.rows || []).find((s: any) => s.productId === p.id);
        initialInputs[p.id] = {
          masuk: existing ? existing.masuk.toString() : '',
          sisa: existing && existing.sisa !== null ? existing.sisa.toString() : ''
        };
      });
      setInputs(initialInputs);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data");
    }
  }

  // Handle Save (Update Stok)
  async function handleUpdateStok() {
    setIsSubmitting(true);
    try {
      for (const p of products) {
        const val = inputs[p.id];
        const existing = stocks.find(s => s.productId === p.id);
        
        // POST new Masuk if doesn't exist and Masuk has value
        if (!existing && val.masuk && val.masuk !== '0') {
           await fetch('/api/stock', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ productId: p.id, quantityIn: parseInt(val.masuk) })
           });
        }
        
        // PATCH Sisa if existing and Sisa has value
        if (existing && val.sisa && val.sisa !== '') {
           await fetch('/api/stock', {
             method: 'PATCH',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ id: existing.id, quantityRemaining: parseInt(val.sisa) })
           });
        }
      }
      alert("Berhasil! Stok telah diperbarui (Sinkronisasi Web Sukses).");
      await fetchData(); // Refresh data
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSelesai() {
    // Save first just in case
    await handleUpdateStok();
    // Redirect to rekap
    router.push('/dashboard/kasir/rekap');
    
    // Pemicu bot telegram untuk kirim rekap PDF akan berjalan via webhook/polling
  }

  // Group by supplier
  const groupedProducts = products.reduce((acc: any, curr: any) => {
    const s = curr.supplier || 'LAIN-LAIN';
    if (!acc[s]) acc[s] = [];
    acc[s].push(curr);
    return acc;
  }, {});

  if (loading) return <Sidebar><div className="p-8 text-center text-sm font-medium text-gray-500">Memuat Sistem Kasir...</div></Sidebar>;

  return (
    <Sidebar>
    <div className="min-h-screen bg-[#fafafa] font-sans pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Pencatatan Nayscake</h1>
        <p className="text-xs text-gray-500 mt-1">Pagi: Masukkan Stok Bawaan &bull; Sore: Masukkan Sisa</p>
      </div>

      <div className="p-4 space-y-6">
        {Object.keys(groupedProducts).map(supplierName => (
          <div key={supplierName} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">{supplierName}</h2>
            <div className="space-y-3">
              {groupedProducts[supplierName].map((p: any) => (
                <div key={p.id} className="bg-white rounded-lg p-4 flex flex-col shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                  <div className="font-semibold text-gray-900 mb-3">{p.name}</div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">Masuk Pagi</label>
                      <input 
                        type="number"
                        min="0"
                        className="w-full bg-white border border-gray-200 rounded-md p-3 text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                        placeholder="0"
                        value={inputs[p.id]?.masuk || ''}
                        onChange={(e) => setInputs({...inputs, [p.id]: {...inputs[p.id], masuk: e.target.value}})}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">Sisa Sore</label>
                      <input 
                        type="number"
                        min="0"
                        className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                        placeholder="0"
                        value={inputs[p.id]?.sisa || ''}
                        onChange={(e) => setInputs({...inputs, [p.id]: {...inputs[p.id], sisa: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-[72px] sm:bottom-[80px] left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:pl-64">
        <button 
          onClick={handleUpdateStok}
          disabled={isSubmitting}
          className="flex-1 bg-white border border-gray-200 text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-semibold rounded-lg h-14 text-sm active:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan...' : 'Sinkronkan Stok'}
        </button>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex-1 bg-black text-white font-semibold rounded-lg h-14 text-sm active:bg-gray-800 transition-colors flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
        >
          Selesai (Tutup Toko)
        </button>
      </div>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Selesaikan Shift?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Pastikan semua kolom <b className="text-gray-700">Sisa Sore</b> telah terisi dengan benar. Menutup toko akan mengunci data dan membuat laporan keuangan.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3 border-t border-gray-100">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-lg text-sm shadow-sm active:bg-gray-100"
              >
                Cek Lagi
              </button>
              <button 
                onClick={() => {
                  setShowModal(false);
                  handleSelesai();
                }}
                className="flex-1 bg-black text-white font-medium py-3 rounded-lg text-sm shadow-md active:bg-gray-800"
              >
                Ya, Tutup Toko
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Sidebar>
  );
}
