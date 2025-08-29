/*
  Warnings:

  - Added the required column `size` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Attachment" ADD COLUMN     "size" BIGINT NOT NULL;
