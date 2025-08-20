/*
  Warnings:

  - Added the required column `bio` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessCategory` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPerson` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gstin` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "bio" TEXT NOT NULL,
ADD COLUMN     "businessCategory" TEXT NOT NULL,
ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "contactPerson" TEXT NOT NULL,
ADD COLUMN     "gstin" TEXT NOT NULL,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "website" TEXT;
