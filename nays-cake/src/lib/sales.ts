import { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/api";
import { audit, dayRange } from "@/lib/business";

type SaleInput = { requestKey: string; orderId?: string; customerName?: string | null; paymentMethod?: string; notes?: string; items: { productId: string; quantity: number; price?: number; cost?: number }[] };

export async function recordSale(tx: Prisma.TransactionClient, input: SaleInput, actor: string) {
  const existing = await tx.sale.findUnique({ where: { requestKey: input.requestKey } });
  if (existing) return existing;
  const quantities = new Map<string, number>();
  for (const i of input.items) quantities.set(i.productId, (quantities.get(i.productId) || 0) + i.quantity);
  const products = await tx.product.findMany({ where: { id: { in: [...quantities.keys()] }, isActive: true } });
  for (const [productId, quantity] of quantities) {
    const entries = await tx.stockEntry.findMany({ where: { productId, date: dayRange() } });
    if (entries.some(e => e.quantityRemaining !== null)) throw new ApiError(409, "Stok produk sudah ditutup hari ini");
    const sold = await tx.saleItem.aggregate({ where: { productId, sale: { saleDate: dayRange() } }, _sum: { quantity: true } });
    if (entries.reduce((s, e) => s + e.quantityIn, 0) - (sold._sum.quantity || 0) < quantity) throw new ApiError(409, "Stok tidak cukup. Catat stok masuk terlebih dahulu.");
  }
  const items = input.items.map(i => {
    const p = products.find(p => p.id === i.productId);
    if (!p) throw new ApiError(400, "Produk tidak tersedia");
    const price = new Prisma.Decimal(input.orderId && i.price !== undefined ? i.price : p.sellingPrice);
    const cost = new Prisma.Decimal(input.orderId && i.cost !== undefined ? i.cost : p.costPrice);
    return { productId: p.id, supplierId: p.supplierId, quantity: i.quantity, price, cost, subtotal: price.mul(i.quantity), profit: price.minus(cost).mul(i.quantity) };
  });
  const totalAmount = items.reduce((s, i) => s.plus(i.subtotal), new Prisma.Decimal(0));
  const totalProfit = items.reduce((s, i) => s.plus(i.profit), new Prisma.Decimal(0));
  const sale = await tx.sale.create({ data: { requestKey: input.requestKey, orderId: input.orderId, customerName: input.customerName, paymentMethod: input.paymentMethod || "cash", notes: input.notes, userId: actor === "bot" ? null : actor, totalAmount, totalProfit, totalCost: totalAmount.minus(totalProfit), items: { create: items } } });
  await audit(tx, actor, "SALE_CREATED", sale.id);
  return sale;
}
