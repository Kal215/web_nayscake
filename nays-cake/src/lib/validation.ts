import { z } from "zod";

export const money = z.coerce.number().finite().min(0).max(99999999.99).multipleOf(0.01);
export const quantity = z.number().int().min(1).max(100000);
export const productInput = z.object({
  name: z.string().trim().min(1).max(150), costPrice: money, sellingPrice: money,
  supplierId: z.string().min(1), category: z.string().trim().max(100).nullish(),
  imageUrl: z.union([z.literal(""), z.url().refine(url => url.startsWith("https://res.cloudinary.com/"), "Gambar harus dari Cloudinary")]).nullish(),
});
export const orderStatus = z.enum(["MENUNGGU", "DIKONFIRMASI", "SELESAI", "DIBATALKAN"]);
export const orderInput = z.object({
  requestKey: z.string().uuid(), customerPhone: z.string().regex(/^\d{8,20}$/).nullish(),
  customerName: z.string().trim().max(150).nullish(), notes: z.string().max(2000).nullish(),
  items: z.array(z.object({ productId: z.string().min(1), quantity, expectedPrice: money.optional() })).min(1).max(100),
  orderType: z.enum(["BELI", "PESANAN"]).default("PESANAN"),
  pickupAt: z.iso.datetime({ offset: true }).nullish(), pickupRaw: z.string().max(500).nullish(),
  pickupLocation: z.enum(["UTAMA", "CABANG"]).nullish(),
});
