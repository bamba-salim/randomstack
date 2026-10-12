-- Rename table (keep data) to match model TechnologyInfo without @@map
ALTER TABLE "TechnologyDetail" RENAME TO "TechnologyInfo";
ALTER TABLE "TechnologyInfo" RENAME CONSTRAINT "TechnologyDetail_pkey" TO "TechnologyInfo_pkey";
ALTER TABLE "TechnologyInfo" RENAME CONSTRAINT "TechnologyDetail_id_fkey" TO "TechnologyInfo_id_fkey";
