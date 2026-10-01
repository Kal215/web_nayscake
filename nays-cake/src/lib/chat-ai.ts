import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/chat-security";
import { chatProviders, providerSelection } from "@/lib/chat-providers";

export const CHAT_FACTS = [
  { id: "ketahanan", text: "Bolu Brownies tahan 2 hari di suhu ruang (3-4 hari di kulkas). Risol Mayo tahan 1 hari di suhu ruang (2-3 hari di kulkas)." },
  { id: "partai_besar", text: "Toko tidak memberikan diskon/potongan harga untuk pesanan jumlah besar, tapi kami akan memberikan BONUS tambahan kue/gorengan di dalamnya." },
  { id: "custom_tumpeng", text: "Toko TIDAK menerima pesanan nasi tumpeng atau kue ultah custom foto. Jika ingin custom, hanya untuk kue basah/gorengan dan WAJIB konfirmasi ke admin." },
  { id: "pickup_pagi", text: "Pesanan TIDAK BISA diambil/dilayani di bawah jam operasional toko. Toko Cililin baru buka jam 06.00 WIB, Rancapanggung jam 07.00 WIB." },
  { id: "jam_utama", text: "Toko utama buka setiap hari pukul 06.00-18.00 WIB." },
  { id: "jam_cabang", text: "Cabang Rancapanggung buka setiap hari pukul 07.00-12.00 WIB." },
  { id: "maps_cabang", text: "Google Maps cabang Rancapanggung: https://maps.app.goo.gl/fzvJrdbCGMVV3yFq7" },
  { id: "pengambilan", text: "Pesanan diambil sendiri di toko. Saat ini tidak tersedia layanan pengantaran." },
  { id: "pembayaran", text: "Pembayaran tersedia melalui tunai, QRIS, dan transfer." },
];
export const HANDOFF_REPLY = { content: "Informasi ini perlu dikonfirmasi admin. Percakapan masuk antrean admin; balasan mungkin tidak langsung tersedia.", handoff: true };
const selection = z.object({ reply: z.string(), handoff: z.boolean() }).strict();
type Product = { id: string; name: string; sellingPrice: number; unit: string; supplier: string };
const CATALOG_URL = "https://nayscake.vercel.app/catalog";
const INQUIRY_REPLY = "Bisa, Kak. Mau tanya tentang kue yang mana, atau ingin melihat pilihan menu dan harganya dulu?";
function normalize(text: string) {
  return text.toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();
}
function simpleIntent(text: string) {
  const value = normalize(text);
  if (/^(hai|halo|hi|selamat pagi|selamat siang|selamat sore|selamat malam)( kak)?$/.test(value)) return "greeting";
  if (/^(terima kasih|makasih|thanks)( banyak)?( kak)?$/.test(value)) return "thanks";
  if (/^(?:(?:saya|aku) )?(?:(?:ingin|mau|boleh|bisa) )?(?:bertanya|tanya)(?: (?:seputar|tentang) kue)?(?: (?:apa |apakah )?(?:bisa|boleh)(?: ya)?)?$/.test(value)) return "inquiry";
  if (/^(?:(?:tolong|kak|halo|hai) )*(?:(?:lihat|tampilkan|minta|mau lihat|boleh lihat) )?(?:semua )?(?:menu(?:nya| nya)?|daftar menu|katalog)(?: (?:lengkap|apa saja|ada apa saja|dong|kak))?$/.test(value)) return "catalog";
  return null;
}
function productLine(product: Product, products: Product[]) {
  if (!Number.isFinite(product.sellingPrice) || product.sellingPrice < 0) throw new Error("Invalid price");
  const duplicate = products.some(p => p.id !== product.id && normalize(p.name) === normalize(product.name));
  return product.name + (duplicate ? " (" + product.supplier + ")" : "") + ": Rp " + product.sellingPrice.toLocaleString("id-ID") + " per " + product.unit + ".";
}
function catalogReply(products: Product[]) {
  if (!products.length) return { content: "Belum ada menu aktif yang bisa saya tampilkan. " + HANDOFF_REPLY.content, handoff: true };
  const sample = [...products].sort((a, b) => a.name.localeCompare(b.name, "id") || a.id.localeCompare(b.id)).slice(0, 5);
  return { content: "Bisa, Kak. Ada " + products.length + " pilihan produk di katalog. " + (products.length > sample.length ? "Berikut beberapa di antaranya:" : "Berikut daftarnya:") + "\n\n" + sample.map(p => "- " + productLine(p, products)).join("\n") + "\n\nAda yang menarik, Kak? Kalau bingung, Kakak bisa tanya rekomendasi ke saya.", handoff: false };
}
export async function answerChat(history: { role: string; content: string }[]) {
  const latest = history.at(-1)?.content || "";
  if (/alerg|halal|komposisi|bahan|pengawet|gluten|kesehatan|\badmin\b|komplain|refund/i.test(latest)) return HANDOFF_REPLY;
  const intent = simpleIntent(latest);
  if (intent === "inquiry") return { content: INQUIRY_REPLY, handoff: false };
  if (intent === "greeting") return { content: history.some(m => m.role === "AI") ? "Halo lagi, Kak. Ada yang ingin ditanyakan?" : "Halo Kak, selamat datang di Nay's Cake. Ada yang ingin ditanyakan tentang menu atau toko?", handoff: false };
  if (intent === "thanks") return { content: "Sama-sama, Kak.", handoff: false };
  try {
    const providers = chatProviders();
    if (!providers.length && intent !== "catalog") return HANDOFF_REPLY;
    const rows = await prisma.product.findMany({
      where: { isActive: true, supplier: { isActive: true } }, take: 501,
      select: { id: true, name: true, sellingPrice: true, unit: true, supplier: { select: { name: true } } },
      orderBy: { id: "asc" },
    });
    if (rows.length > 500) return HANDOFF_REPLY;
    const products = rows.map(p => ({ ...p, sellingPrice: Number(p.sellingPrice), supplier: p.supplier.name }));
    if (intent === "catalog") return catalogReply(products);

    // Ambil Fakta Dinamis (Hasil Belajar)
    let dynamicFacts = "";
    try {
      const dbFacts = await prisma.botFact.findMany({ where: { approved: true } });
      dynamicFacts = dbFacts.map((f: any) => `${f.topic}: ${f.text}`).join("\n");
    } catch (e) { console.error(e); }
    
    const prompt = `Anda adalah Lyra, asisten AI ramah dari toko Nay's Cake. Berikan balasan langsung dan luwes kepada pelanggan berdasarkan percakapan.
Fakta Tambahan (Wajib Dipatuhi jika relevan):
${dynamicFacts}


Jika pelanggan bertanya rekomendasi kue atau menu, berikan beberapa opsi dari katalog (beserta harganya) secara natural.
Jangan menyuruh pelanggan bertanya ke admin jika kamu bisa menjawabnya sendiri dari katalog atau fakta.
Aturan:
1. Ramah, santai, gunakan sapaan 'Kak'.
2. Handoff = true HANYA JIKA pelanggan meminta admin/mamah, marah/komplain berat, atau bertanya hal teknis (pembayaran/pesanan) di luar konteks fakta.
3. Format JSON: {"reply": "Teks balasan kamu", "handoff": false/true}.
Fakta resmi: ${JSON.stringify(CHAT_FACTS)}
Katalog: ${JSON.stringify(products)}`;
    const deadline = Date.now() + 18000;
    for (const provider of providers) {
      const remaining = deadline - Date.now();
      if (remaining < 250) break;
      await rateLimit("ai-global", 300, 86400);
      const timeout = Math.min(6000, deadline - Date.now());
      if (timeout < 250) break;
      try {
        const choice = selection.parse(await providerSelection(provider, prompt, history, timeout));
        if (choice.reply.trim() === "") throw new Error("Empty reply");
        return { content: choice.reply, handoff: choice.handoff };
      } catch {
        // Fall back to next provider
      }
    }
    return HANDOFF_REPLY;
  } catch {
    // Never log customer content, credentials, or unvalidated model output.
    return HANDOFF_REPLY;
  }
}
