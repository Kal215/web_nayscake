import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/orders/[id]  body: { status }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const valid = ["MENUNGGU", "DIKONFIRMASI", "SELESAI", "DIBATALKAN"];
    if (!valid.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    return NextResponse.json({ order });
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengubah status" }, { status: 500 });
  }
}
