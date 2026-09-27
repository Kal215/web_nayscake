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
  const determinedRole = primaryEmail === "riskalfadhilla215@gmail.com" ? "ADMIN" : "CUSTOMER";

  let errorMessage = "";

  try {
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
      redirect("/dashboard");
    } else {
      redirect("/catalog");
    }
  } catch (error: any) {
    // Tangkap errornya di sini alih-alih meledak!
    errorMessage = error?.message || String(error);
  }

  // Jika gagal, tampilkan pesan merah raksasa ini
  return (
    <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
      <h2>DATABASE SINKRONISASI GAGAL!</h2>
      <p>Error Asli dari Mesin Database (NeonDB):</p>
      <pre style={{ background: '#f5f5f5', padding: '1rem', color: '#333' }}>
        {errorMessage}
      </pre>
      <p><strong>Status Anda:</strong> Telah berhasil login di Clerk, tetapi Database menolak menyimpannya.</p>
    </div>
  );
}
