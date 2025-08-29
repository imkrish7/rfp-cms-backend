/*
  Warnings:

  - Added the required column `status` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AttachmentStatus" AS ENUM ('PENDING', 'UPLOADED', 'FAILED');

-- AlterTable
ALTER TABLE "public"."Attachment" ADD COLUMN     "status" "public"."AttachmentStatus" NOT NULL;
