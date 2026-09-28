// Verifikasi Kunci Kriptografi (Gatekeeper M2M) untuk endpoint yang dipakai bot WhatsApp.
import { NextResponse } from "next/server";
import { createHash } from "crypto";

export function cekKunciBot(request: Request): NextResponse | null {
  // Bot mengirimkan Password Asli lewat header x-api-key
  const passwordInput = request.headers.get("x-api-key");
  
  // Sistem Next.js membaca Hash Abadi dari .env
  // (Pastikan BOT_API_KEY_HASH diset dengan Hash SHA-256)
  const targetHash = process.env.BOT_API_KEY_HASH || process.env.BOT_API_KEY; 
  
  if (!targetHash) {
    // env belum diset → tolak semua
    return NextResponse.json({ error: "Sistem Gatekeeper Kriptografi belum dikonfigurasi di Server." }, { status: 503 });
  }

  if (!passwordInput) {
    return NextResponse.json({ error: "Akses Ditolak: Kunci Kripto tidak ditemukan." }, { status: 401 });
  }

  // Next.js merubah input password menjadi Hash SHA-256 (Zero-Knowledge Validation)
  const inputHash = createHash("sha256").update(passwordInput).digest("hex");

  if (inputHash !== targetHash) {
    // Sebagai fallback masa lalu (kalau targetHash belum diubah jadi hash), 
    // kita juga cek plain text agar sistem lama tidak langsung mati
    if (passwordInput !== targetHash) {
      return NextResponse.json({ error: "Akses Ditolak: Gembok Kriptografi tidak cocok!" }, { status: 401 });
    }
  }

  return null; // Lolos verifikasi
}
