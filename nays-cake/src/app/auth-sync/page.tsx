import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AuthSyncPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const primaryEmail = user.emailAddresses[0]?.emailAddress;
  const name = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : primaryEmail;
  // Fallback Role
  const determinedRole = ["riskalfadhilla215@gmail.com", "nayscake16@gmail.com"].includes(primaryEmail) ? "ADMIN" : "CUSTOMER";

  // Upsert langsung tanpa try-catch, karena kolom sudah ada!
  const dbUser = await prisma.user.upsert({
    where: { email: primaryEmail },
    update: { 
      clerkId: user.id,
      name: name,
      role: determinedRole === "ADMIN" ? "ADMIN" : undefined 
    },
    create: {
      clerkId: user.id,
      email: primaryEmail,
      name: name,
      role: determinedRole
    }
  });

  if (dbUser.role === "ADMIN") {
    redirect("/dashboard/kasir");
  } else {
    redirect("/catalog");
  }
}
