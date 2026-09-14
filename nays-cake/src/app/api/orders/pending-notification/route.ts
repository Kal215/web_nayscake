import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cekKunciBot } from "@/lib/botAuth";

// GET /api/orders/pending-notification  (header x-api-key wajib)
// Mengembalikan pesanan berstatus MENUNGGU yang belum dinotifikasi (notifiedAt null).
export async function GET(request: Request) {
  const tolak = cekKunciBot(request);
  if (tolak) return tolak;

  try {
    const orders = await prisma.order.findMany({
      where: { status: "MENUNGGU", notifiedAt: null },
      include: { items: true },
      orderBy: { createdAt: "asc" },
      take: 20,
    });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders/pending-notification error:", error);
    return NextResponse.json({ error: "Gagal memuat pesanan" }, { status: 500 });
  }
}
