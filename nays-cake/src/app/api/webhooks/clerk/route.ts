import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // 1. Ambil Kunci Rahasia
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Tolong tambahkan CLERK_WEBHOOK_SECRET dari Dashboard Clerk ke Vercel');
  }

  // 2. Ambil Sidik Jari Kriptografi dari Kepala Permintaan (Header)
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Jika sidik jari tidak ada, tolak (Anti-Hacker)
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Akses Ditolak: Sidik Jari Tidak Lengkap', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 3. Verifikasi Sidik Jari Asli dari Clerk
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error memverifikasi webhook:', err);
    return new Response('Akses Ditolak: Verifikasi Sidik Jari Gagal', { status: 400 });
  }

  // 4. Proses Payload (Sinyal yang Dikirim)
  const eventType = evt.type;

  // Jika sinyalnya adalah "Pelanggan Baru Mendaftar"
  if (eventType === 'user.created') {
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses[0]?.email_address;
    const namaLengkap = [first_name, last_name].filter(Boolean).join(' ') || 'Pelanggan Baru';

    try {
      // Simpan data pelanggan langsung ke tabel SQL NeonDB Anda
      await prisma.user.create({
        data: {
          clerkId: clerkId,
          name: namaLengkap,
          email: primaryEmail,
          imageUrl: image_url,
          role: 'CUSTOMER', // Ditandai sebagai pelanggan otomatis
        },
      });
      console.log(`Sinkronisasi Enterprise Berhasil: Profil ${namaLengkap} masuk ke NeonDB!`);
    } catch (error) {
      console.error('Gagal menyimpan ke database:', error);
      return new Response('Error internal saat menyimpan data', { status: 500 });
    }
  }

  return new Response('Webhook Berhasil Diterima & Diproses', { status: 200 });
}
