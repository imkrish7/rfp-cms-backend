/*
  Warnings:

  - The primary key for the `RFPEmbedding` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `RFPEmbedding` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "public"."RFPEmbedding" DROP CONSTRAINT "RFPEmbedding_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "RFPEmbedding_pkey" PRIMARY KEY ("id");
