BEGIN;
CREATE TYPE "ChatMode" AS ENUM ('AI', 'WAITING', 'ADMIN');
CREATE TYPE "ChatRole" AS ENUM ('VISITOR', 'AI', 'ADMIN', 'SYSTEM');
CREATE TABLE "ChatConversation" (
  "id" TEXT PRIMARY KEY, "tokenHash" TEXT NOT NULL UNIQUE,
  "mode" "ChatMode" NOT NULL DEFAULT 'AI', "assigneeId" TEXT,
  "version" INTEGER NOT NULL DEFAULT 0, "messageCount" INTEGER NOT NULL DEFAULT 0,
  "visitorSequence" INTEGER NOT NULL DEFAULT 0, "adminReadSequence" INTEGER NOT NULL DEFAULT 0,
  "aiJobId" TEXT, "aiStartedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "ChatConversation_updatedAt_id_idx" ON "ChatConversation"("updatedAt", "id");
CREATE INDEX "ChatConversation_expiresAt_idx" ON "ChatConversation"("expiresAt");
CREATE TABLE "ChatMessage" (
  "id" TEXT PRIMARY KEY, "conversationId" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL, "role" "ChatRole" NOT NULL,
  "content" TEXT NOT NULL, "requestId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ChatMessage_conversationId_sequence_key" ON "ChatMessage"("conversationId", "sequence");
CREATE UNIQUE INDEX "ChatMessage_conversationId_requestId_key" ON "ChatMessage"("conversationId", "requestId");
CREATE TABLE "ChatRateBucket" ("key" TEXT PRIMARY KEY, "count" INTEGER NOT NULL DEFAULT 1, "expiresAt" TIMESTAMP(3) NOT NULL);
CREATE INDEX "ChatRateBucket_expiresAt_idx" ON "ChatRateBucket"("expiresAt");
COMMIT;
