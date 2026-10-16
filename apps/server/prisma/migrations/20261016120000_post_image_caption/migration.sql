-- Légende optionnelle de la cover article
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "imageCaption" TEXT;
