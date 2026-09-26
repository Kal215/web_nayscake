import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("key") !== "lyra-admin") {
      return NextResponse.json({ status: "Akses Ditolak" }, { status: 401 });
    }

    // Ambil 5 kue acak
    const products = await prisma.product.findMany({ take: 5 });
    const ids = products.map((p: any) => p.id);
    
    // Suntikkan stok 50 buah dan buat tersedia
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isAvailable: true, stock: 50 }
    });

    return NextResponse.json({ 
      success: true, 
      pesan: "Berhasil menyuntikkan 50 stok ke 5 kue pertama!",
      kueTersedia: products.map((p: any) => p.name) 
    });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
