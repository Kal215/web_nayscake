"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getDbUserForCheckout() {
  const user = await currentUser();
  if (!user) return null;

  const primaryEmail = user.emailAddresses[0]?.emailAddress;
  if (!primaryEmail) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: primaryEmail },
    select: { nomor_hp: true, address: true, metode_ambil: true }
  });

  return dbUser;
}

import { randomUUID } from "crypto";

export async function createDraftOrder(cartItems: any[], total: number) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const primaryEmail = user.emailAddresses[0]?.emailAddress;
  if (!primaryEmail) throw new Error("No Email");

  const dbUser = await prisma.user.findUnique({
    where: { email: primaryEmail }
  });

  const orderNumber = "NAY-" + Math.floor(1000 + Math.random() * 9000).toString(); // e.g. NAY-4521

  // Map products
  const products = await prisma.product.findMany({
    where: { id: { in: cartItems.map(i => i.id) } }
  });

  const itemsData = cartItems.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) throw new Error(`Product missing: ${item.name}`);
    return {
      productId: p.id,
      productName: p.name,
      quantity: item.quantity,
      price: p.sellingPrice,
      subtotal: Number(p.sellingPrice) * item.quantity
    };
  });

  const newOrder = await prisma.order.create({
    data: {
      orderNumber: orderNumber,
      requestKey: randomUUID(),
      customerName: user.firstName || "Pelanggan",
      customerPhone: dbUser?.nomor_hp || "",
      notes: "Draft dari Website",
      pickupLocation: dbUser?.metode_ambil === "Ambil di Cabang" ? "CABANG" : "UTAMA",
      totalAmount: total,
      status: "MENUNGGU",
      source: "website",
      items: {
        create: itemsData
      }
    }
  });

  return newOrder.orderNumber;
}
