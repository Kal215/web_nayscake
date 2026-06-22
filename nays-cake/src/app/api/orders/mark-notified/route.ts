import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cekKunciBot } from "@/lib/botAuth";

// POST /api/orders/mark-notified  (header x-api-key wajib)
// body: { ids: string[] }  → set notifiedAt = now untuk id tsb.
export async function POST(request: Request) {
  const tolak = cekKunciBot(request);
  if (tolak) return tolak;

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids wajib diisi" }, { status: 400 });
    }
    const result = await prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { notifiedAt: new Date() },
    });
    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error("POST /api/orders/mark-notified error:", error);
    return NextResponse.json({ error: "Gagal menandai" }, { status: 500 });
  }
}
