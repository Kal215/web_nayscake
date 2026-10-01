"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function saveProfile(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Not logged in");

  const primaryEmail = user.emailAddresses[0]?.emailAddress;
  if (!primaryEmail) throw new Error("No email found");

  const nomor_hp = formData.get("nomor_hp") as string;
  const address = formData.get("address") as string;
  const metode_ambil = formData.get("metode_ambil") as string;

  // Upsert user to ensure they exist in db
  await prisma.user.upsert({
    where: { email: primaryEmail },
    update: {
      nomor_hp,
      address,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Pengguna",
      clerkId: user.id,
      imageUrl: user.imageUrl,
    },
    create: {
      email: primaryEmail,
      clerkId: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Pengguna",
      imageUrl: user.imageUrl,
      nomor_hp,
      address,
    }
  });

  revalidatePath("/profil");
  return { success: true };
}
