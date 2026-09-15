import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAdmin } from "@/lib/api";
import { dayRange } from "@/lib/business";
import { report } from "@/lib/reporting";
import { inventory } from "@/lib/inventory";
export async function GET() {
  try {
    await requireAdmin();
    const [products, suppliers, waiting, data, stock, health] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true }, include: { supplier: true } }),
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: "MENUNGGU" } }),
      report(dayRange().gte, dayRange().lt), inventory(),
      prisma.settings.findUnique({ where: { key: "bot-health" } }),
    ]);
    const bot = health ? JSON.parse(health.value) : null;
    return NextResponse.json({ products: products.length, suppliers, waiting, ...data, bot: { ...bot, online: !!bot && Date.now() - Date.parse(bot.lastSeen) < 180000 }, lowStock: products.filter(p => (stock.get(p.id) || 0) < p.minStock).map(p => ({ id: p.id, name: p.name, supplier: p.supplier.name, stock: stock.get(p.id) || 0 })) });
  } catch (error) { return apiError(error); }
}
