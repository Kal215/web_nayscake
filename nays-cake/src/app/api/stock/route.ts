import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ApiError, requireAdmin } from "@/lib/api";
import { audit, dayRange, jakartaDate, transaction } from "@/lib/business";
import { z } from "zod";
import { report } from "@/lib/reporting";

export async function GET() {
  try {
    await requireAdmin();
    const entries = await prisma.stockEntry.findMany({ where: { date: dayRange() }, include: { product: { include: { supplier: true } } }, orderBy: { createdAt: "desc" } });
    const reconciliation = await report(dayRange().gte, dayRange().lt);
    const rows = entries.map(e => {
      const hargaJual = Number(e.price ?? e.product.sellingPrice), modal = Number(e.cost ?? e.product.costPrice);
      const sudahSelesai = e.quantityRemaining !== null;
      const terjual = sudahSelesai ? e.quantityIn - e.quantityRemaining! - e.quantityReturned - e.quantityDamaged : 0;
      return { id: e.id, productId: e.productId, nama: e.product.name, supplier: e.product.supplier.name, supplierId: e.product.supplierId, hargaJual, modal, masuk: e.quantityIn, sisa: e.quantityRemaining, retur: e.quantityReturned, rusak: e.quantityDamaged, terjual: sudahSelesai ? terjual : null, omzet: sudahSelesai ? terjual * hargaJual : null, setoran: sudahSelesai ? terjual * modal : null, laba: sudahSelesai ? terjual * (hargaJual - modal) : null, sudahSelesai };
    });
    const perPemasok = new Map<string, { nama: string; setoran: number; laba: number; terjual: number }>();
    // Allocate reconciled totals across legacy multiple entries for the same day.
    for (const r of rows) {
      if (!r.sudahSelesai) continue;
      const total = reconciliation.rows.find(total => total.productId === r.productId);
      const dailyQuantity = rows.filter(other => other.productId === r.productId).reduce((s, other) => s + (other.terjual || 0), 0);
      if (total && !total.pending && dailyQuantity > 0) {
        const share = (r.terjual || 0) / dailyQuantity;
        r.omzet = total.revenue * share; r.setoran = total.cost * share; r.laba = total.profit * share;
      }
    }
    for (const r of rows) {
      const s = perPemasok.get(r.supplierId) || { nama: r.supplier, setoran: 0, laba: 0, terjual: 0 };
      s.setoran += r.setoran || 0; s.laba += r.laba || 0; s.terjual += r.terjual || 0;
      perPemasok.set(r.supplierId, s);
    }
    return NextResponse.json({ tanggal: jakartaDate(), rows, ringkasan: {
      totalMasuk: rows.reduce((s, r) => s + r.masuk, 0), totalTerjual: rows.reduce((s, r) => s + (r.terjual || 0), 0),
      totalOmzet: rows.reduce((s, r) => s + (r.omzet || 0), 0), totalModal: rows.reduce((s, r) => s + (r.setoran || 0), 0),
      totalLaba: rows.reduce((s, r) => s + (r.laba || 0), 0), jumlahEntry: rows.length, belumIsiSisa: rows.filter(r => !r.sudahSelesai).length,
    }, setoranPemasok: [...perPemasok.values()] });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    const body = z.object({ productId: z.string().min(1), quantityIn: z.number().int().min(1).max(100000), notes: z.string().max(2000).optional() }).parse(await request.json());
    const entry = await transaction(async tx => {
      const p = await tx.product.findUnique({ where: { id: body.productId } });
      if (!p?.isActive) throw new ApiError(400, "Produk tidak tersedia");
      const closed = await tx.stockEntry.count({ where: { productId: p.id, date: dayRange(), quantityRemaining: { not: null } } });
      if (closed) throw new ApiError(409, "Penutupan stok sudah dimulai hari ini");
      const existing = await tx.stockEntry.findFirst({ where: { productId: p.id, date: dayRange() }, orderBy: { createdAt: "desc" } });
      if (existing?.quantityRemaining != null) throw new ApiError(409, "Stok sudah ditutup hari ini");
      const entry = existing ? await tx.stockEntry.update({ where: { id: existing.id }, data: { quantityIn: { increment: body.quantityIn }, notes: body.notes ?? existing.notes } }) : await tx.stockEntry.create({ data: { ...body, price: p.sellingPrice, cost: p.costPrice } });
      await audit(tx, user.id, "STOCK_RECEIVED", entry.id, String(body.quantityIn));
      return entry;
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAdmin();
    const count = z.number().int().min(0).max(100000);
    const body = z.object({ id: z.string().min(1), quantityRemaining: count, quantityReturned: count.default(0), quantityDamaged: count.default(0) }).parse(await request.json());
    const entry = await transaction(async tx => {
      const current = await tx.stockEntry.findUnique({ where: { id: body.id } });
      if (!current) throw new ApiError(404, "Stok tidak ditemukan");
      if (jakartaDate(current.date) !== jakartaDate()) throw new ApiError(409, "Stok hari sebelumnya tidak dapat diubah");
      const sold = await tx.saleItem.aggregate({ where: { productId: current.productId, sale: { saleDate: dayRange() } }, _sum: { quantity: true } });
      const others = await tx.stockEntry.findMany({ where: { productId: current.productId, date: dayRange(), id: { not: body.id } } });
      const otherClosedSold = others.reduce((s, e) => s + (e.quantityRemaining === null ? 0 : e.quantityIn - e.quantityRemaining - e.quantityReturned - e.quantityDamaged), 0);
      const inferred = current.quantityIn - body.quantityRemaining - body.quantityReturned - body.quantityDamaged;
      if (inferred < 0 || (!others.some(e => e.quantityRemaining === null) && inferred + otherClosedSold < (sold._sum.quantity || 0))) throw new ApiError(409, "Sisa, retur, dan rusak tidak sesuai dengan stok masuk atau penjualan tercatat");
      const updated = await tx.stockEntry.update({ where: { id: body.id }, data: { quantityRemaining: body.quantityRemaining, quantityReturned: body.quantityReturned, quantityDamaged: body.quantityDamaged } });
      await audit(tx, user.id, "STOCK_CLOSED", body.id, JSON.stringify(body));
      return updated;
    });
    return NextResponse.json({ entry });
  } catch (error) { return apiError(error); }
}
