/*
  Warnings:

  - Added the required column `logo` to the `Org` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Org" ADD COLUMN     "logo" TEXT NOT NULL,
ADD COLUMN     "website" TEXT;
