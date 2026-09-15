"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingCart, ClipboardList, TrendingUp, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
type Dashboard = { products: number; suppliers: number; waiting: number; pending: number; totals: { revenue: number; profit: number }; bot: { online: boolean; pending?: number; failed?: number; lastSeen?: string }; lowStock: { id: string; name: string; supplier: string; stock: number }[] };
const money = (n: number) => "Rp " + n.toLocaleString("id-ID");
export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try { const res = await fetch("/api/dashboard"); const body = await res.json(); if (!res.ok) throw new Error(body.error); if (active) { setData(body); setError(""); } }
      catch (e) { if (active) setError(e instanceof Error ? e.message : "Gagal memuat dashboard"); }
    };
    void load(); const timer = setInterval(load, 60000);
    return () => { active = false; clearInterval(timer); };
  }, [refresh]);
  return <Sidebar><main className="max-w-7xl mx-auto space-y-6">
    <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Dashboard</h1><button title="Muat ulang" aria-label="Muat ulang" onClick={() => setRefresh(n => n + 1)} className="neo-action p-2 border rounded-lg"><RefreshCw size={20} /></button></div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {!data && !error && <p role="status">Memuat dashboard...</p>}
    {data && <>
      <dl className="grid grid-cols-2 xl:grid-cols-4 gap-6 border-b pb-6">
        {[["Produk Aktif", data.products], ["Supplier Aktif", data.suppliers], ["Omzet Hari Ini", money(data.totals.revenue)], ["Laba Hari Ini", money(data.totals.profit)]].map(([label, value]) => <div key={label} className="neo-surface neo-metric"><dt className="text-sm text-gray-600">{label}</dt><dd className="text-lg font-semibold mt-2 break-words">{value}</dd></div>)}
      </dl>
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-b pb-5 text-sm">
        <span className={data.bot.online ? "text-green-700" : "text-red-700"}>WhatsApp: {data.bot.online ? "Terhubung" : "Tidak terhubung"}</span>
        <span>Belum sinkron: {data.bot.pending ?? "-"}</span><span>Perlu diperiksa: {data.bot.failed ?? "-"}</span>
        <Link className="underline" href="/dashboard/pesanan">{data.waiting} pesanan menunggu</Link>
      </div>
      {data.pending > 0 && <p className="text-amber-800 text-sm">{data.pending} produk belum ditutup. Omzet sementara.</p>}
      <nav className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[{ name: "Stok Harian", href: "stok", icon: Package }, { name: "Penjualan", href: "penjualan", icon: ShoppingCart }, { name: "Pesanan", href: "pesanan", icon: ClipboardList }, { name: "Laporan", href: "laporan", icon: TrendingUp }].map(item => <Link key={item.href} href={"/dashboard/" + item.href} className="neo-action flex items-center gap-2 border rounded-lg p-3 hover:bg-gray-100 text-sm"><item.icon size={18} />{item.name}</Link>)}</nav>
      <section className="border-t pt-5"><h2 className="font-semibold mb-3">Stok di Bawah Minimum</h2>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Produk</th><th className="p-3">Supplier</th><th className="p-3">Stok</th></tr></thead><tbody>{data.lowStock.map(p => <tr className="border-b" key={p.id}><td className="p-3">{p.name}</td><td className="p-3">{p.supplier}</td><td className="p-3 text-red-700">{p.stock} pcs</td></tr>)}</tbody></table></div>
        {!data.lowStock.length && <p className="text-gray-500 py-6">Tidak ada produk di bawah stok minimum.</p>}
      </section>
    </>}
  </main></Sidebar>;
}
