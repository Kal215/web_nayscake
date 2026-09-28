import { PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient({ datasources: { db: { url: "postgresql://postgres:test@localhost:5432/postgres?schema=public" } } });

async function run() {
  const email = "admin@nayscake.com";
  const key = createHash("sha256").update(email).digest("hex");
  try {
    const attempts = await prisma.$queryRaw`
      INSERT INTO "LoginAttempt" ("key", "count", "expiresAt") VALUES (${key}, 1, NOW() + INTERVAL '15 minutes')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "LoginAttempt"."expiresAt" < NOW() THEN 1 ELSE "LoginAttempt"."count" + 1 END,
        "expiresAt" = CASE WHEN "LoginAttempt"."expiresAt" < NOW() THEN NOW() + INTERVAL '15 minutes' ELSE "LoginAttempt"."expiresAt" END
      RETURNING "count"`;
    console.log("Attempts:", attempts);
    console.log("Count is BigInt?", typeof attempts[0].count === 'bigint');
    if (attempts[0].count > 10) {
      console.log("RATE LIMITED");
    } else {
      console.log("ALLOWED");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
