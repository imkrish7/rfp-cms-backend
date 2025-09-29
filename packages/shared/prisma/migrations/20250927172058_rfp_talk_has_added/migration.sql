-- CreateTable
CREATE TABLE "public"."RFPTalk" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RFPTalk_pkey" PRIMARY KEY ("id")
);
