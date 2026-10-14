-- Sources éditoriales + horodatage soft-delete (purge 90j)
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "sources" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Post_status_publishAt_idx" ON "Post"("status", "publishAt");
CREATE INDEX IF NOT EXISTS "Post_deletedAt_idx" ON "Post"("deletedAt");
