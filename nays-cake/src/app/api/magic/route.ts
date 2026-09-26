import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("key") !== "lyra-admin") {
      return NextResponse.json({ status: "Akses Ditolak" }, { status: 401 });
    }

    // Ekstrak nama database dari DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || "";
    let dbName = "Tidak Terdeteksi";
    if (dbUrl) {
      const parts = dbUrl.split("?");
      const path = parts[0].split("/");
      dbName = path[path.length - 1];
    }

    const products = await prisma.product.findMany({ take: 5 });
    const stockData = products.map((p: any) => ({
      productId: p.id,
      quantityIn: 50,
      notes: "Suntikan Uji Coba (AI)"
    }));
    
    await prisma.stockEntry.createMany({ data: stockData });

    const ids = products.map((p: any) => p.id);
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive: true }
    });

    return NextResponse.json({ 
      success: true, 
      pesan: "Berhasil!",
      namaDatabaseNeon: dbName,
      kueTersedia: products.map((p: any) => p.name) 
    });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
