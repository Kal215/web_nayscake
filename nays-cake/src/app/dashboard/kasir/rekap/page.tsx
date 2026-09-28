'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HalamanRekap() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stock')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert("Gagal memuat rekap data");
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-sm font-medium text-gray-500">Menyusun Laporan Excel...</div>;

  const rows = data?.rows || [];
  const ringkasan = data?.ringkasan || {};

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 pb-32 md:pl-64">
      {/* Header Struk */}
      <div className="bg-white p-6 rounded-t-xl border border-gray-200 border-b-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-black"></div>
        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight mb-1">REKAPITULASI HARIAN</h1>
        <p className="text-sm text-gray-500 font-medium">{data?.tanggal || 'Hari Ini'}</p>
      </div>

      {/* Tabel 6 Kolom Responsive */}
      <div className="bg-white border border-gray-200 border-t-dashed rounded-b-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 py-3">Barang (Pemasok)</th>
                <th className="p-4 py-3 text-right">Harga</th>
                <th className="p-4 py-3 text-center">Bawa</th>
                <th className="p-4 py-3 text-center">Sisa</th>
                <th className="p-4 py-3 text-center bg-gray-100">Laku</th>
                <th className="p-4 py-3 text-right bg-gray-900 text-white">Setoran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-gray-900 text-sm">{r.nama}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{r.supplier}</div>
                  </td>
                  <td className="p-4 text-right text-sm text-gray-600 font-medium">
                    Rp {r.hargaJual?.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-center font-medium text-gray-700">
                    {r.masuk}
                  </td>
                  <td className="p-4 text-center font-medium text-gray-700">
                    {r.sisa ?? '-'}
                  </td>
                  <td className="p-4 text-center font-bold text-gray-900 bg-gray-50/50">
                    {r.terjual ?? '-'}
                  </td>
                  <td className="p-4 text-right font-bold text-gray-900 bg-gray-50/50">
                    Rp {r.setoran?.toLocaleString('id-ID') ?? '-'}
                  </td>
                </tr>
              ))}
              
              {/* Row Total Laku dan Setoran */}
              <tr className="bg-gray-900 text-white font-bold text-sm">
                <td colSpan={4} className="p-4 py-5 text-right uppercase tracking-wider text-gray-300">
                  Total Keseluruhan
                </td>
                <td className="p-4 py-5 text-center text-lg">
                  {ringkasan.totalTerjual}
                </td>
                <td className="p-4 py-5 text-right text-lg">
                  Rp {ringkasan.totalModal?.toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold py-4 rounded-lg shadow-sm text-sm active:bg-gray-50 transition-colors"
        >
          Kembali ke Dasbor
        </button>
        <button 
          onClick={() => window.print()}
          className="flex-1 bg-black text-white font-semibold py-4 rounded-lg shadow-md text-sm active:bg-gray-800 transition-colors"
        >
          Cetak PDF Lokal
        </button>
      </div>
    </div>
  );
}
