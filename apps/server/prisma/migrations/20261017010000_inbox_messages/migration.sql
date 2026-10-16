-- CreateEnum
CREATE TYPE "InboxKind" AS ENUM ('TECH_REPORT', 'POST_REPORT', 'TECH_SUGGESTION', 'ARTICLE_SUGGESTION', 'AUTHOR_REQUEST');

-- CreateEnum
CREATE TYPE "InboxStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "InboxMessage" (
    "id" TEXT NOT NULL,
    "kind" "InboxKind" NOT NULL,
    "status" "InboxStatus" NOT NULL DEFAULT 'OPEN',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "technologyId" TEXT,
    "postId" TEXT,
    "meta" JSONB,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InboxMessage_kind_status_idx" ON "InboxMessage"("kind", "status");

-- CreateIndex
CREATE INDEX "InboxMessage_authorId_idx" ON "InboxMessage"("authorId");

-- CreateIndex
CREATE INDEX "InboxMessage_createdAt_idx" ON "InboxMessage"("createdAt");

-- CreateIndex
CREATE INDEX "InboxMessage_technologyId_idx" ON "InboxMessage"("technologyId");

-- CreateIndex
CREATE INDEX "InboxMessage_postId_idx" ON "InboxMessage"("postId");

-- AddForeignKey
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
