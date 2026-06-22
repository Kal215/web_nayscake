import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cekKunciBot } from "@/lib/botAuth";

// Nomor urut: NAY-0001, NAY-0002, ...
async function nomorBaru(): Promise<string> {
  const terakhir = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  });
  let n = 0;
  if (terakhir?.orderNumber) {
    const m = terakhir.orderNumber.match(/(\d+)$/);
    if (m) n = parseInt(m[1], 10);
  }
  return "NAY-" + String(n + 1).padStart(4, "0");
}

// GET /api/orders?status=MENUNGGU  → daftar pesanan (untuk dashboard)
// Dipakai dashboard (sudah login), TIDAK perlu kunci bot.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const where = status ? { status: status as any } : {};
    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Gagal memuat pesanan" }, { status: 500 });
  }
}

// POST /api/orders  → bot kirim pesanan baru. WAJIB kunci x-api-key.
// body: { customerPhone?, customerName?, notes?,
//         items: [{ productId, quantity }] }
export async function POST(request: Request) {
  const tolak = cekKunciBot(request);
  if (tolak) return tolak;

  try {
    const body = await request.json();
    const { customerPhone, customerName, notes, items, orderType, pickupAt, pickupRaw, pickupLocation } = body;

    // Validasi ringan pickupLocation: hanya terima "UTAMA" atau "CABANG"
    const loc = pickupLocation;
    const validPickupLocation = (loc === "UTAMA" || loc === "CABANG") ? loc : null;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items wajib diisi" }, { status: 400 });
    }

    // Ambil harga ASLI dari database (jangan percaya kiriman bot)
    const ids = items.map((i: any) => i.productId).filter(Boolean);
    const produk = await prisma.product.findMany({ where: { id: { in: ids } } });
    const peta = new Map(produk.map((p) => [p.id, p]));

    let totalAmount = 0;
    const itemData = [];
    for (const it of items) {
      const p = peta.get(it.productId);
      const qty = parseInt(String(it.quantity), 10);
      if (!p || isNaN(qty) || qty < 1) {
        return NextResponse.json(
          { error: `Item tidak valid: ${it.productId}` },
          { status: 400 }
        );
      }
      const price = Number(p.sellingPrice);
      const subtotal = price * qty;
      totalAmount += subtotal;
      itemData.push({
        productId: p.id,
        productName: p.name,
        quantity: qty,
        price,
        subtotal,
      });
    }

    const orderNumber = await nomorBaru();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerPhone: customerPhone ?? null,
        customerName: customerName ?? null,
        notes: notes ?? null,
        orderType: orderType ?? null,
        pickupAt: pickupAt ? new Date(pickupAt) : null,
        pickupRaw: pickupRaw ?? null,
        pickupLocation: validPickupLocation,
        totalAmount,
        items: { create: itemData },
      },
      include: { items: true },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pesanan" }, { status: 500 });
  }
}
