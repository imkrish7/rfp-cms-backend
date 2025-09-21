/*
  Warnings:

  - You are about to drop the `proposal_embeddings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rfp_embeddings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."proposal_embeddings" DROP CONSTRAINT "proposal_embeddings_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."rfp_embeddings" DROP CONSTRAINT "rfp_embeddings_rfpId_fkey";

-- DropTable
DROP TABLE "public"."proposal_embeddings";

-- DropTable
DROP TABLE "public"."rfp_embeddings";

-- CreateTable
CREATE TABLE "public"."RFPEmbedding" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RFPEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProposalEmbedding" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalEmbedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."RFPEmbedding" ADD CONSTRAINT "RFPEmbedding_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "public"."rfps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProposalEmbedding" ADD CONSTRAINT "ProposalEmbedding_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "public"."proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
