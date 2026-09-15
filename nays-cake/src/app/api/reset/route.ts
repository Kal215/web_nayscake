import { NextResponse } from "next/server";
import { apiError, ApiError, requireAdmin } from "@/lib/api";
import { audit, dayRange, jakartaDate, transaction } from "@/lib/business";
import { prisma } from "@/lib/prisma";

// Recorded sales are immutable. Only unused, open stock can be cleared.
export async function POST() {
  try {
    const user = await requireAdmin(true);
    await transaction(async tx => {
      const sales = await tx.sale.count({ where: { saleDate: dayRange() } });
      const closed = await tx.stockEntry.count({ where: { date: dayRange(), quantityRemaining: { not: null } } });
      if (sales || closed) throw new ApiError(409, "Hari ini sudah memiliki transaksi atau stok ditutup. Data tidak dapat direset.");
      const deleted = await tx.stockEntry.deleteMany({ where: { date: dayRange() } });
      await audit(tx, user.id, "UNUSED_STOCK_RESET", jakartaDate(), String(deleted.count));
    });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
export async function GET() {
  try {
    await requireAdmin();
    const sales = await prisma.sale.aggregate({ where: { saleDate: dayRange() }, _count: true, _sum: { totalAmount: true, totalProfit: true } });
    return NextResponse.json({ date: jakartaDate(), totalSales: sales._count, totalRevenue: Number(sales._sum.totalAmount || 0), totalProfit: Number(sales._sum.totalProfit || 0) });
  } catch (error) { return apiError(error); }
}
