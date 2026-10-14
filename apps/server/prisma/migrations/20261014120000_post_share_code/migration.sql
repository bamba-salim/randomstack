-- Permalien opaque pour les articles (remplace le slug dans les URLs publiques)
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "shareCode" TEXT;

UPDATE "Post"
SET "shareCode" = upper(substr(md5(random()::text || id::text || clock_timestamp()::text), 1, 8))
WHERE "shareCode" IS NULL OR "shareCode" = '';

ALTER TABLE "Post" ALTER COLUMN "shareCode" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Post_shareCode_key" ON "Post"("shareCode");
CREATE INDEX IF NOT EXISTS "Post_shareCode_idx" ON "Post"("shareCode");
