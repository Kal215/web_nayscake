// Verifikasi kunci API untuk endpoint yang dipakai bot WhatsApp.
import { NextResponse } from "next/server";

export function cekKunciBot(request: Request): NextResponse | null {
  const kunci = request.headers.get("x-api-key");
  const benar = process.env.BOT_API_KEY;
  if (!benar) {
    // env belum diset → tolak semua, jangan diam-diam mengizinkan
    return NextResponse.json({ error: "Server belum dikonfigurasi" }, { status: 503 });
  }
  if (!kunci || kunci !== benar) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }
  return null; // null = lolos
}
