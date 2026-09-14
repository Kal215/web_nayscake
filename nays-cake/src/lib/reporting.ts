import { prisma } from "@/lib/prisma";
import { jakartaDate } from "@/lib/business";

export async function report(gte: Date, lt: Date) {
  const [entries, items] = await Promise.all([
    prisma.stockEntry.findMany({ where: { date: { gte, lt } }, include: { product: { include: { supplier: true } } } }),
    prisma.saleItem.findMany({ where: { sale: { saleDate: { gte, lt } } }, include: { product: true, sale: true, supplier: true } }),
  ]);
  type Row = { date: string; productId: string; name: string; supplier: string; sold: number; revenue: number; cost: number; profit: number; recorded: number; inferred: number; pending: boolean };
  const rows = new Map<string, Row>();
  const get = (date: string, productId: string, name: string, supplier: string) => {
    const key = date + ":" + productId;
    if (!rows.has(key)) rows.set(key, { date, productId, name, supplier, sold: 0, revenue: 0, cost: 0, profit: 0, recorded: 0, inferred: 0, pending: false });
    return rows.get(key)!;
  };
  for (const i of items) {
    const row = get(jakartaDate(i.sale.saleDate), i.productId, i.product.name, i.supplier.name);
    row.recorded += i.quantity; row.sold += i.quantity;
    row.revenue += Number(i.subtotal); row.cost += Number(i.cost) * i.quantity;
  }
  const closed = new Map<string, { quantity: number; revenue: number; cost: number }>();
  for (const e of entries) {
    const date = jakartaDate(e.date), key = date + ":" + e.productId;
    const row = get(date, e.productId, e.product.name, e.product.supplier.name);
    if (e.quantityRemaining === null) { row.pending = true; continue; }
    const quantity = e.quantityIn - e.quantityRemaining - e.quantityReturned - e.quantityDamaged;
    const sum = closed.get(key) || { quantity: 0, revenue: 0, cost: 0 };
    sum.quantity += quantity; sum.revenue += quantity * Number(e.price ?? e.product.sellingPrice); sum.cost += quantity * Number(e.cost ?? e.product.costPrice);
    closed.set(key, sum);
  }
  // Cashier sales are a subset of the daily stock result, never added twice.
  for (const [key, sum] of closed) {
    const row = rows.get(key)!;
    if (row.pending) continue;
    row.inferred = Math.max(0, sum.quantity - row.recorded);
    row.sold += row.inferred;
    if (sum.quantity) { row.revenue += row.inferred * sum.revenue / sum.quantity; row.cost += row.inferred * sum.cost / sum.quantity; }
  }
  const result = [...rows.values()].map(r => ({ ...r, revenue: Math.round(r.revenue * 100) / 100, cost: Math.round(r.cost * 100) / 100, profit: Math.round((r.revenue - r.cost) * 100) / 100 })).sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
  return { rows: result, totals: result.reduce((s, r) => ({ revenue: s.revenue + r.revenue, cost: s.cost + r.cost, profit: s.profit + r.profit, sold: s.sold + r.sold }), { revenue: 0, cost: 0, profit: 0, sold: 0 }), pending: result.filter(r => r.pending).length };
}
