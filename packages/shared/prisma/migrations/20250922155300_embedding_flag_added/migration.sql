/*
  Warnings:

  - Added the required column `isRFPProcessed` to the `rfps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."rfps" ADD COLUMN     "isRFPProcessed" BOOLEAN NOT NULL;
