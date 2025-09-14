-- AlterTable
ALTER TABLE "public"."rfps" ALTER COLUMN "scopeOfWork" SET NOT NULL,
ALTER COLUMN "scopeOfWork" SET DATA TYPE TEXT,
ALTER COLUMN "evaluationCriteria" SET NOT NULL,
ALTER COLUMN "evaluationCriteria" SET DATA TYPE TEXT,
ALTER COLUMN "deliverables" SET NOT NULL,
ALTER COLUMN "deliverables" SET DATA TYPE TEXT;
