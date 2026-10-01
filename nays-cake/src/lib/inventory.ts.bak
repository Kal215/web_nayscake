import { prisma } from "@/lib/prisma";
import { dayRange } from "@/lib/business";

export async function inventory() {
  const [entries, sales] = await Promise.all([
    prisma.stockEntry.findMany({ where: { date: dayRange() } }),
    prisma.saleItem.groupBy({ by: ["productId"], where: { sale: { saleDate: dayRange() } }, _sum: { quantity: true } }),
  ]);
  const sold = new Map(sales.map(s => [s.productId, s._sum.quantity || 0]));
  const stock = new Map<string, { incoming: number; inferredSold: number; removed: number }>();
  for (const e of entries) {
    const row = stock.get(e.productId) || { incoming: 0, inferredSold: 0, removed: 0 };
    row.incoming += e.quantityIn;
    row.removed += e.quantityReturned + e.quantityDamaged;
    if (e.quantityRemaining !== null) row.inferredSold += e.quantityIn - e.quantityRemaining - e.quantityReturned - e.quantityDamaged;
    stock.set(e.productId, row);
  }
  return new Map([...stock].map(([id, s]) => [id, Math.max(0, s.incoming - Math.max(s.inferredSold, sold.get(id) || 0) - s.removed)]));
}
