/*
  Warnings:

  - You are about to drop the column `contactNumber` on the `vendors` table. All the data in the column will be lost.
  - Added the required column `contactEmail` to the `vendors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."vendors" DROP COLUMN "contactNumber",
ADD COLUMN     "contactEmail" TEXT NOT NULL;
