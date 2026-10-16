-- CreateEnum
CREATE TYPE "CompatibilityKind" AS ENUM ('WORKS_WITH', 'RECOMMENDED', 'INCOMPATIBLE');

-- CreateTable
CREATE TABLE "TechnologyCompatibility" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "kind" "CompatibilityKind" NOT NULL,
    "note" TEXT,

    CONSTRAINT "TechnologyCompatibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TechnologyCompatibility_fromId_toId_key" ON "TechnologyCompatibility"("fromId", "toId");

-- CreateIndex
CREATE INDEX "TechnologyCompatibility_fromId_idx" ON "TechnologyCompatibility"("fromId");

-- CreateIndex
CREATE INDEX "TechnologyCompatibility_toId_idx" ON "TechnologyCompatibility"("toId");

-- CreateIndex
CREATE INDEX "TechnologyCompatibility_kind_idx" ON "TechnologyCompatibility"("kind");

-- AddForeignKey
ALTER TABLE "TechnologyCompatibility" ADD CONSTRAINT "TechnologyCompatibility_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyCompatibility" ADD CONSTRAINT "TechnologyCompatibility_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;
