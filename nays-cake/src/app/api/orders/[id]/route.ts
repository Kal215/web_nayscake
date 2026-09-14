import { NextResponse } from "next/server";
import { apiError, ApiError, requireOperator } from "@/lib/api";
import { audit, transaction } from "@/lib/business";
import { orderStatus } from "@/lib/validation";
import { z } from "zod";
import { recordSale } from "@/lib/sales";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireOperator(request);
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new ApiError(404, "Pesanan tidak ditemukan");
    const history = await prisma.auditLog.findMany({ where: { entityId: id }, orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json({ order, history });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireOperator(request);
    const { id } = await params;
    const body = z.object({ status: orderStatus, paid: z.boolean().optional() }).parse(await request.json());
    const order = await transaction(async tx => {
      const current = await tx.order.findFirst({ where: { OR: [{ id }, { orderNumber: id }] }, include: { items: true } });
      if (!current) throw new ApiError(404, "Pesanan tidak ditemukan");
      if (current.status === body.status) return current;
      const allowed: Record<string, string[]> = { MENUNGGU: ["DIKONFIRMASI", "DIBATALKAN"], DIKONFIRMASI: ["SELESAI", "DIBATALKAN"], SELESAI: [], DIBATALKAN: [] };
      if (!allowed[current.status].includes(body.status)) throw new ApiError(409, "Perubahan status tidak diizinkan");
      if (body.status === "SELESAI") {
        if (!body.paid) throw new ApiError(400, "Konfirmasi pembayaran sebelum menyelesaikan pesanan");
        await recordSale(tx, { orderId: current.id, requestKey: "order:" + current.id, customerName: current.customerName, items: current.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: Number(i.price), cost: i.cost === null ? undefined : Number(i.cost) })) }, actor);
      }
      const updated = await tx.order.update({ where: { id: current.id }, data: { status: body.status }, include: { items: true } });
      await audit(tx, actor, "ORDER_STATUS", current.id, current.status + " -> " + body.status);
      if (current.customerPhone) await tx.notification.create({ data: { eventKey: current.id + ":" + body.status, phone: current.customerPhone, text: "Nay's Cake: pesanan " + current.orderNumber + " " + body.status.toLowerCase().replaceAll("_", " ") + "." } });
      return updated;
    });
    return NextResponse.json({ order });
  } catch (error) { return apiError(error); }
}
