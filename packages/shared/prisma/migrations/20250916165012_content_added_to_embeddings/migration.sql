/*
  Warnings:

  - Added the required column `metadata` to the `ProposalEmbedding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metadata` to the `RFPEmbedding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ProposalEmbedding" ADD COLUMN     "metadata" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "public"."RFPEmbedding" ADD COLUMN     "metadata" JSONB NOT NULL;
