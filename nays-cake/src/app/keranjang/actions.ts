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
    select: { nomor_hp: true, address: true }
  });

  return dbUser;
}
