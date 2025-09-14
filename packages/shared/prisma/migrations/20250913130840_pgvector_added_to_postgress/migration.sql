CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "public"."rfp_embedding" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "embeding" vector NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfp_embedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proposal_embedding" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "embeding" vector NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_embedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."rfp_embedding" ADD CONSTRAINT "rfp_embedding_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "public"."rfps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposal_embedding" ADD CONSTRAINT "proposal_embedding_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "public"."proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
