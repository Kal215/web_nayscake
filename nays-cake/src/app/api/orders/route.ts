import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { cekKunciBot } from "@/lib/botAuth";
import { apiError, ApiError, requireOperator } from "@/lib/api";
import { orderInput, orderStatus } from "@/lib/validation";
import { audit, transaction } from "@/lib/business";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    await requireOperator(request);
    const q = new URL(request.url).searchParams;
    const status = q.get("status") ? orderStatus.parse(q.get("status")) : undefined;
    const search = (q.get("search") || "").slice(0, 150);
    const page = z.coerce.number().int().min(1).max(10000).parse(q.get("page") || 1);
    const orders = await prisma.order.findMany({
      where: { status, ...(search ? { OR: [{ orderNumber: { contains: search, mode: "insensitive" as const } }, { customerPhone: { contains: search } }, { customerName: { contains: search, mode: "insensitive" as const } }] } : {}) },
      include: { items: true, sale: { select: { id: true } } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 101, skip: (page - 1) * 100,
    });
    return NextResponse.json({ orders: orders.slice(0, 100), hasMore: orders.length > 100, page });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  const denied = cekKunciBot(request);
  if (denied) return denied;
  let requestKey: string | undefined;
  try {
    const body = orderInput.parse(await request.json());
    requestKey = body.requestKey;
    const existing = await prisma.order.findUnique({ where: { requestKey }, include: { items: true } });
    if (existing) return NextResponse.json({ order: existing }, { status: 201 });
    const pickup = body.pickupAt ? new Date(body.pickupAt) : null;
    if (body.orderType === "PESANAN" && !pickup) throw new ApiError(400, "Tanggal pengambilan wajib diisi");
    if (pickup) {
      if (pickup.getTime() <= Date.now()) throw new ApiError(400, "Tanggal pengambilan sudah lewat");
      const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", hourCycle: "h23" }).format(pickup));
      const branch = body.pickupLocation === "CABANG";
      if (hour < (branch ? 7 : 6) || hour >= (branch ? 12 : 18)) throw new ApiError(400, "Jam pengambilan di luar jam buka toko");
    }
    if (body.pickupLocation === "CABANG" && body.items.reduce((s, i) => s + i.quantity, 0) > 300) throw new ApiError(400, "Pesanan di atas 300 pcs harus di toko utama");
    const order = await transaction(async tx => {
      const products = await tx.product.findMany({ where: { id: { in: body.items.map(i => i.productId) }, isActive: true, supplier: { isActive: true } } });
      const items = body.items.map(item => {
        const p = products.find(p => p.id === item.productId);
        if (!p) throw new ApiError(400, "Produk tidak tersedia");
        if (item.expectedPrice !== undefined && item.expectedPrice !== Number(p.sellingPrice)) throw new ApiError(409, "Harga berubah. Perbarui produk dan konfirmasi ulang.");
        return { productId: p.id, productName: p.name, quantity: item.quantity, price: p.sellingPrice, cost: p.costPrice, subtotal: p.sellingPrice.mul(item.quantity) };
      });
      const created = await tx.order.create({ data: {
        orderNumber: "NAY-" + randomUUID().replaceAll("-", "").toUpperCase(),
        requestKey: body.requestKey, customerPhone: body.customerPhone, customerName: body.customerName,
        notes: body.notes, orderType: body.orderType, pickupAt: pickup, pickupRaw: body.pickupRaw,
        pickupLocation: body.pickupLocation, totalAmount: items.reduce((s, i) => s + Number(i.subtotal), 0), items: { create: items },
      }, include: { items: true } });
      await audit(tx, "bot", "ORDER_CREATED", created.id);
      return created;
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (requestKey && error && typeof error === "object" && "code" in error && error.code === "P2002") {
      const existing = await prisma.order.findUnique({ where: { requestKey }, include: { items: true } });
      if (existing) return NextResponse.json({ order: existing }, { status: 201 });
    }
    return apiError(error);
  }
}
