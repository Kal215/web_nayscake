import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  
  if (!user) {
    redirect("/");
  }

  const primaryEmail = user.emailAddresses?.[0]?.emailAddress || "";
  let dbUser = null;

  // Pelindung Anti-Ledakan (Try-Catch) agar aplikasi tidak mati jika koneksi DB bermasalah
  if (primaryEmail) {
    try {
      dbUser = await prisma.user.findFirst({
        where: { email: primaryEmail }
      });
    } catch (error) {
      console.error("Gagal membaca dari NeonDB:", error);
    }
  }

  // Cek pangkat Admin
  const isAdmin = dbUser?.role === "ADMIN" || ["riskalfadhilla215@gmail.com", "nayscake16@gmail.com"].includes(primaryEmail);

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="neo-page min-h-screen bg-gray-100">
      {children}
    </div>
  );
}
