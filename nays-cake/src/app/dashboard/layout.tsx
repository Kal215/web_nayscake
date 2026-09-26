import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Membaca KTP Baru (Clerk)
  const user = await currentUser();
  
  if (!user) {
    redirect("/");
  }

  const primaryEmail = user.emailAddresses[0]?.emailAddress;

  // Membaca pangkat dari Database NeonDB
  const dbUser = await prisma.user.findFirst({
    where: { email: primaryEmail }
  });

  // Proteksi Ganda (Bypass khusus untuk email Anda agar tidak pernah terkunci)
  const isAdmin = dbUser?.role === "ADMIN" || primaryEmail === "riskalfadhilla215@gmail.com";

  if (!isAdmin) {
    // Jika ada Pembeli Nakal yang mencoba mengetik /dashboard, mereka akan tertendang!
    redirect("/");
  }

  return (
    <div className="neo-page min-h-screen bg-gray-100">
      {children}
    </div>
  );
}
