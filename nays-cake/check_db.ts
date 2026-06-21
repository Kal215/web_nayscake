import { prisma } from './src/lib/prisma';
async function main() {
  const users = await prisma.user.findMany();
  console.log("DB USERS:", users);
}
main();
