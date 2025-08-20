-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" TEXT,
ADD COLUMN     "emailVerificationCode" TEXT,
ADD COLUMN     "isActivated" BOOLEAN NOT NULL DEFAULT false;
