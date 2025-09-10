/*
  Warnings:

  - You are about to drop the column `price` on the `proposals` table. All the data in the column will be lost.
  - Added the required column `cost` to the `proposals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."proposals" DROP COLUMN "price",
ADD COLUMN     "cost" DECIMAL(12,2) NOT NULL;
