import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "riskal@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Riskal215123";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Update existing user or create
  const admin = await prisma.user.upsert({
    where: { email: "admin@nayscake.com" }, // find the old admin
    update: {
      email: adminEmail,
      password: hashedPassword,
    },
    create: {
      name: "Admin Nay's Cake",
      email: adminEmail,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    }
  });

  console.log("SUCCESS! Admin user updated to:", admin.email);
}

main().catch(console.error);
