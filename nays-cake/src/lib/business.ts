import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function jakartaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function dayRange(date = jakartaDate()) {
  const start = new Date(`${date}T00:00:00+07:00`);
  return { gte: start, lt: new Date(start.getTime() + 86400000) };
}

// Retry serialization conflicts; never replay side effects outside the database.
export async function transaction<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await prisma.$transaction(work, { isolationLevel: "Serializable", timeout: 15000 }); }
    catch (error) {
      if (attempt >= 3 || !(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034") throw error;
    }
  }
}

export async function audit(tx: Prisma.TransactionClient, actor: string, action: string, entityId: string, details?: string) {
  await tx.auditLog.create({ data: { actor, action, entityId, details } });
}
