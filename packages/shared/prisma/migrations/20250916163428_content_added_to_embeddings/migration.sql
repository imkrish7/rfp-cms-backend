/*
  Warnings:

  - You are about to drop the `proposal_embedding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rfp_embedding` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."proposal_embedding" DROP CONSTRAINT "proposal_embedding_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."rfp_embedding" DROP CONSTRAINT "rfp_embedding_rfpId_fkey";

-- DropTable
DROP TABLE "public"."proposal_embedding";

-- DropTable
DROP TABLE "public"."rfp_embedding";

-- CreateTable
CREATE TABLE "public"."rfp_embeddings" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embeding" vector NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfp_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proposal_embeddings" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embeding" vector NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_embeddings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."rfp_embeddings" ADD CONSTRAINT "rfp_embeddings_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "public"."rfps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposal_embeddings" ADD CONSTRAINT "proposal_embeddings_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "public"."proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
