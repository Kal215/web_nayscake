const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const key = 'test';
    const attempts = await prisma.$queryRaw`
      INSERT INTO "LoginAttempt" ("key", "count", "expiresAt") VALUES (${key}, 1, NOW() + INTERVAL '15 minutes')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "LoginAttempt"."expiresAt" < NOW() THEN 1 ELSE "LoginAttempt"."count" + 1 END,
        "expiresAt" = CASE WHEN "LoginAttempt"."expiresAt" < NOW() THEN NOW() + INTERVAL '15 minutes' ELSE "LoginAttempt"."expiresAt" END
      RETURNING "count"`;
    console.log(attempts);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();