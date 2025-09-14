/*
  Warnings:

  - You are about to drop the column `attachments` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `attachments` on the `rfps` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AssociatedTo" AS ENUM ('RFP', 'CONTRACT', 'PROPOSAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ProposalStatus" ADD VALUE 'DRAFT';
ALTER TYPE "public"."ProposalStatus" ADD VALUE 'SUBMITTED';

-- AlterTable
ALTER TABLE "public"."proposals" DROP COLUMN "attachments";

-- AlterTable
ALTER TABLE "public"."rfps" DROP COLUMN "attachments";

-- CreateTable
CREATE TABLE "public"."Attachment" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT,
    "proposalId" TEXT,
    "contractId" TEXT,
    "filename" TEXT NOT NULL,
    "fileurl" TEXT NOT NULL,
    "filetype" TEXT NOT NULL,
    "associatedTo" "public"."AssociatedTo" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "public"."rfps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "public"."proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "public"."contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
