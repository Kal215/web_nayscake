"use client";
import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";

type Report = { rows: { date: string; productId: string; name: string; supplier: string; sold: number; revenue: number; cost: number; profit: number; recorded: number; inferred: number; pending: boolean }[]; totals: { revenue: number; cost: number; profit: number; sold: number }; pending: number };
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const money = (n: number) => "Rp " + n.toLocaleString("id-ID");
export default function LaporanPage() {
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/reports?" + new URLSearchParams({ from, to }), { signal: controller.signal }).then(async res => {
      const body = await res.json(); if (!res.ok) throw new Error(body.error); setData(body); setError("");
    }).catch(e => { if (e.name !== "AbortError") { setError(e.message); setData(null); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [from, to, refresh]);
  return <Sidebar><main className="max-w-7xl mx-auto space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Laporan Penjualan</h1>
      <div className="flex gap-2"><button type="button" title="Muat ulang" aria-label="Muat ulang" onClick={() => { setLoading(true); setRefresh(n => n + 1); }} className="p-2 border rounded-lg"><RefreshCw size={20} /></button>
      <a aria-disabled={loading || !!error} className={"flex items-center gap-2 border rounded-lg px-3 py-2 " + (loading || error ? "pointer-events-none opacity-50" : "")} href={"/api/reports?" + new URLSearchParams({ from, to, format: "csv" })}><Download size={18} />CSV</a></div>
    </div>
    <div className="flex flex-wrap gap-4 border-b pb-5">
      <label className="text-sm">Dari<input aria-label="Dari tanggal" type="date" value={from} max={to} onChange={e => { setLoading(true); setFrom(e.target.value); }} className="block border rounded-lg p-2 mt-1" /></label>
      <label className="text-sm">Sampai<input aria-label="Sampai tanggal" type="date" value={to} min={from} onChange={e => { setLoading(true); setTo(e.target.value); }} className="block border rounded-lg p-2 mt-1" /></label>
    </div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {loading ? <p role="status">Memuat laporan...</p> : data && <>
      <dl className="grid grid-cols-2 xl:grid-cols-4 gap-5 border-b pb-6">
        {[["Omzet", money(data.totals.revenue)], ["Modal", money(data.totals.cost)], ["Laba", money(data.totals.profit)], ["Terjual", data.totals.sold.toLocaleString("id-ID") + " pcs"]].map(([title, value]) => <div key={title}><dt className="text-sm text-gray-600">{title}</dt><dd className="mt-2 text-lg font-semibold break-words">{value}</dd></div>)}
      </dl>
      {data.pending > 0 && <p className="text-amber-800">{data.pending} produk/hari belum ditutup. Omzet sementara.</p>}
      <div className="overflow-x-auto"><table className="w-full text-sm text-left whitespace-nowrap"><thead className="border-b"><tr>{["Tanggal", "Produk", "Pemasok", "Terjual", "Omzet", "Modal", "Laba", "Status"].map(t => <th key={t} className="p-3">{t}</th>)}</tr></thead>
        <tbody>{data.rows.map(r => <tr className="border-b" key={r.date + r.productId}><td className="p-3">{r.date}</td><td className="p-3">{r.name}</td><td className="p-3">{r.supplier}</td><td className="p-3">{r.sold}</td><td className="p-3">{money(r.revenue)}</td><td className="p-3">{money(r.cost)}</td><td className="p-3">{money(r.profit)}</td><td className="p-3">{r.pending ? "Sementara" : "Tercatat"}</td></tr>)}</tbody>
      </table></div>
      {!data.rows.length && <p className="py-8 text-center text-gray-500">Belum ada transaksi pada periode ini.</p>}
    </>}
  </main></Sidebar>;
}
