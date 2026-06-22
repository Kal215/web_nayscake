import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/count → { count: number }
// Ringan: hanya menghitung pesanan berstatus MENUNGGU.
// Dipakai dashboard (sudah login) untuk polling alarm. Tanpa kunci bot.
export async function GET() {
  try {
    const count = await prisma.order.count({ where: { status: "MENUNGGU" } });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("GET /api/orders/count error:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
