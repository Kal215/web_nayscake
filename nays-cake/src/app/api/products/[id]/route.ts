import { NextResponse } from "next/server";
import { apiError, ApiError, requireAdmin } from "@/lib/api";
import { audit, transaction } from "@/lib/business";
import { productInput } from "@/lib/validation";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const data = productInput.parse(await request.json());
    const product = await transaction(async tx => {
      const existing = await tx.product.findUnique({ where: { id }, include: { _count: { select: { stockEntries: true, saleItems: true, orderItems: true } } } });
      if (!existing) throw new ApiError(404, "Produk tidak ditemukan");
      if (existing.supplierId !== data.supplierId && (existing._count.stockEntries || existing._count.saleItems || existing._count.orderItems)) throw new ApiError(409, "Produk memiliki riwayat transaksi. Buat produk baru untuk pemasok yang berbeda.");
      const supplier = await tx.supplier.findUnique({ where: { id: data.supplierId } });
      if (!supplier?.isActive) throw new ApiError(400, "Pemasok tidak tersedia");
      const p = await tx.product.update({ where: { id }, data: { ...data, imageUrl: data.imageUrl || null }, include: { supplier: true } });
      await audit(tx, user.id, "PRODUCT_UPDATED", id);
      return p;
    });
    return NextResponse.json(product);
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin(true);
    const { id } = await params;
    await transaction(async tx => {
      await tx.product.update({ where: { id }, data: { isActive: false } });
      await audit(tx, user.id, "PRODUCT_ARCHIVED", id);
    });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
