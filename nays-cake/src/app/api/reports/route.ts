import { NextResponse } from "next/server";
import { apiError, ApiError, requireAdmin } from "@/lib/api";
import { dayRange, jakartaDate } from "@/lib/business";
import { report } from "@/lib/reporting";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const q = new URL(request.url).searchParams;
    const from = z.iso.date().parse(q.get("from") || jakartaDate());
    const to = z.iso.date().parse(q.get("to") || jakartaDate());
    const gte = dayRange(from).gte, lt = dayRange(to).lt;
    if (lt <= gte || lt.getTime() - gte.getTime() > 366 * 86400000) throw new ApiError(400, "Pilih rentang tanggal maksimal satu tahun");
    const data = await report(gte, lt);
    if (q.get("format") === "csv") {
      const cell = (value: unknown) => '"' + String(value).replace(/^[=+@-]/, "'$&").replaceAll('"', '""') + '"';
      const csv = ["Tanggal,Produk,Pemasok,Terjual,Omzet,Modal,Laba,Kasir,Rekonsiliasi,BelumTutup", ...data.rows.map(r => [r.date, r.name, r.supplier, r.sold, r.revenue, r.cost, r.profit, r.recorded, r.inferred, r.pending].map(cell).join(","))].join("\r\n");
      return new Response("\uFEFF" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="laporan-${from}-${to}.csv"` } });
    }
    return NextResponse.json(data);
  } catch (error) { return apiError(error); }
}
