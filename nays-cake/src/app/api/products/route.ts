import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ApiError, requireAdmin } from "@/lib/api";
import { inventory } from "@/lib/inventory";
import { productInput } from "@/lib/validation";
import { audit, transaction } from "@/lib/business";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams;
    const internal = q.get("internal") === "1";
    if (internal) await requireAdmin();
    const where: Prisma.ProductWhereInput = { isActive: true, supplier: { isActive: true } };
    if (q.get("search")) where.OR = [{ name: { contains: q.get("search")!.slice(0, 150), mode: "insensitive" } }, { category: { contains: q.get("search")!.slice(0, 150), mode: "insensitive" } }];
    if (q.get("category")) where.category = q.get("category");
    if (q.get("supplier")) where.supplier = { isActive: true, name: q.get("supplier")! };
    const [products, stock] = await Promise.all([prisma.product.findMany({ where, include: { supplier: true }, orderBy: { name: "asc" } }), inventory()]);
    return NextResponse.json({
      products: products.map(p => ({ id: p.id, name: p.name, slug: p.slug, sellingPrice: Number(p.sellingPrice), category: p.category, supplier: p.supplier.name, stock: stock.get(p.id) || 0, minStock: p.minStock, isAvailable: (stock.get(p.id) || 0) > 0, imageUrl: p.imageUrl, ...(internal ? { costPrice: Number(p.costPrice), supplierId: p.supplierId } : {}) })),
      categories: [...new Set(products.map(p => p.category).filter(Boolean))],
      suppliers: internal ? [...new Map(products.map(p => [p.supplierId, { id: p.supplierId, name: p.supplier.name }])).values()] : [],
      total: products.length,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    const data = productInput.parse(await request.json());
    const product = await transaction(async tx => {
      const supplier = await tx.supplier.findUnique({ where: { id: data.supplierId } });
      if (!supplier?.isActive) throw new ApiError(400, "Pemasok tidak tersedia");
      const p = await tx.product.create({ data: { ...data, slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + crypto.randomUUID(), imageUrl: data.imageUrl || null }, include: { supplier: true } });
      await audit(tx, user.id, "PRODUCT_CREATED", p.id);
      return p;
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) { return apiError(error); }
}
