-- Auteur unique : authorIds[] → authorId
-- No-op si déjà appliqué / init déjà en authorId (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Post' AND column_name = 'authorIds'
  ) THEN
    ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "authorId" TEXT;

    UPDATE "Post"
    SET "authorId" = "authorIds"[1]
    WHERE cardinality("authorIds") >= 1;

    ALTER TABLE "Post" DROP COLUMN "authorIds";

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE indexname = 'Post_authorId_idx'
    ) THEN
      CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'Post_authorId_fkey'
    ) THEN
      ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey"
        FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;
