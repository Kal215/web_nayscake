import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function awalHariIni(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  try {
    const today = awalHariIni();
    const entries = await prisma.stockEntry.findMany({
      where: { date: { gte: today } },
      include: { product: { include: { supplier: true } } },
      orderBy: { createdAt: "desc" },
    });

    let totalMasuk = 0, totalTerjual = 0, totalOmzet = 0, totalModal = 0, totalLaba = 0;
    const perPemasok: Record<string, { nama: string; setoran: number; laba: number; terjual: number }> = {};

    const rows = entries.map((e) => {
      const masuk = e.quantityIn;
      const sisa = e.quantityRemaining;
      const hargaJual = Number(e.product.sellingPrice);
      const modal = Number(e.product.costPrice);
      const sudahSelesai = sisa !== null && sisa !== undefined;
      const terjual = sudahSelesai ? Math.max(0, masuk - (sisa as number)) : 0;
      const omzet = terjual * hargaJual;
      const setoran = terjual * modal;
      const laba = omzet - setoran;

      if (sudahSelesai) {
        totalMasuk += masuk; totalTerjual += terjual; totalOmzet += omzet;
        totalModal += setoran; totalLaba += laba;
        const pid = e.product.supplierId;
        if (!perPemasok[pid]) perPemasok[pid] = { nama: e.product.supplier.name, setoran: 0, laba: 0, terjual: 0 };
        perPemasok[pid].setoran += setoran;
        perPemasok[pid].laba += laba;
        perPemasok[pid].terjual += terjual;
      } else {
        totalMasuk += masuk;
      }

      return {
        id: e.id, productId: e.productId, nama: e.product.name,
        supplier: e.product.supplier.name, supplierId: e.product.supplierId,
        hargaJual, modal, masuk,
        sisa: sudahSelesai ? sisa : null,
        terjual: sudahSelesai ? terjual : null,
        omzet: sudahSelesai ? omzet : null,
        setoran: sudahSelesai ? setoran : null,
        laba: sudahSelesai ? laba : null,
        sudahSelesai,
      };
    });

    const setoranPemasok = Object.values(perPemasok).sort((a, b) => a.nama.localeCompare(b.nama));

    return NextResponse.json({
      tanggal: today.toISOString().slice(0, 10),
      rows,
      ringkasan: {
        totalMasuk, totalTerjual, totalOmzet, totalModal, totalLaba,
        jumlahEntry: rows.length,
        belumIsiSisa: rows.filter((r) => !r.sudahSelesai).length,
      },
      setoranPemasok,
    });
  } catch (error) {
    console.error("GET /api/stock error:", error);
    return NextResponse.json({ error: "Gagal memuat stok harian" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { productId, quantityIn, notes } = await request.json();
    if (!productId || quantityIn === undefined || quantityIn === null) {
      return NextResponse.json({ error: "productId dan quantityIn wajib diisi" }, { status: 400 });
    }
    const masuk = parseInt(String(quantityIn), 10);
    if (isNaN(masuk) || masuk < 0 || masuk > 100000) {
      return NextResponse.json({ error: "Jumlah masuk tidak valid" }, { status: 400 });
    }
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });

    const today = awalHariIni();
    const existing = await prisma.stockEntry.findFirst({
      where: { productId, date: { gte: today } },
      orderBy: { createdAt: "desc" },
    });

    let entry;
    if (existing) {
      entry = await prisma.stockEntry.update({
        where: { id: existing.id },
        data: { quantityIn: existing.quantityIn + masuk, notes: notes ?? existing.notes },
      });
    } else {
      entry = await prisma.stockEntry.create({ data: { productId, quantityIn: masuk, notes } });
    }
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/stock error:", error);
    return NextResponse.json({ error: "Gagal menyimpan stok masuk" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, quantityRemaining } = await request.json();
    if (!id || quantityRemaining === undefined || quantityRemaining === null) {
      return NextResponse.json({ error: "id dan quantityRemaining wajib diisi" }, { status: 400 });
    }
    const sisa = parseInt(String(quantityRemaining), 10);
    if (isNaN(sisa) || sisa < 0 || sisa > 100000) {
      return NextResponse.json({ error: "Jumlah sisa tidak valid" }, { status: 400 });
    }
    const entry = await prisma.stockEntry.findUnique({ where: { id } });
    if (!entry) return NextResponse.json({ error: "Entry tidak ditemukan" }, { status: 404 });
    if (sisa > entry.quantityIn) {
      return NextResponse.json({ error: `Sisa (${sisa}) tidak boleh lebih dari yang masuk (${entry.quantityIn}).` }, { status: 400 });
    }
    const updated = await prisma.stockEntry.update({
      where: { id },
      data: { quantityRemaining: sisa },
    });
    return NextResponse.json({ entry: updated });
  } catch (error) {
    console.error("PATCH /api/stock error:", error);
    return NextResponse.json({ error: "Gagal menyimpan sisa" }, { status: 500 });
  }
}
