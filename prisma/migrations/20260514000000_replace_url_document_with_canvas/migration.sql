ALTER TABLE "projects" DROP COLUMN IF EXISTS "urlDocument";
ALTER TABLE "projects" ADD COLUMN "canvas" JSONB;
