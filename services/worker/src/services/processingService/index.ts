import { embedContent, prisma } from "@rfp/shared"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { logger } from "../../core/logger";
import { getDocument } from "../../core/minio";
import path from "path";
import { fileURLToPath } from "url";
import { queues } from "../queues";



const loadDocuments = async (url: string) => {
    try {

        const documents = new PDFLoader(url);
        return documents.load();
        
    } catch (error) {
        throw error;
    }
}

export const RFPProcessing = async (data: { id: string }) => {
    
    try {
        const attachments = await prisma.attachment.findMany({
            where: {rfpId: data.id}
        })
        let isRFPProcessed = false;
        if (attachments.length > 0) {
            for (let attachment of attachments) {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const fileDirs = path.join(__dirname, "document")
                const filePath = path.join(fileDirs, `current.pdf`);
                
                const _documents = await getDocument(attachment.objectPath, "rfp-cms", filePath);
                
                const document = await loadDocuments(filePath);

                const textsplitters = new RecursiveCharacterTextSplitter({
                    separators: ["\n\n"],
                    chunkOverlap: 10,
                    chunkSize: 200
                });
                
                if (document) {
                    const documents = await textsplitters.splitDocuments(document);
                    for (let doc of documents) {
                        const embedding = await embedContent(doc.pageContent);
                        const _ = await prisma.$executeRawUnsafe(`
                                INSERT INTO "RFPEmbedding" ("id","rfpId","content","embedding","metadata","createdAt","updatedAt")
                                VALUES (
                                    gen_random_uuid(),
                                    $1,
                                    $2,
                                    $3::vector,
                                    $4,
                                    NOW(),
                                    NOW()
                                )
                                `, data.id, doc.pageContent, embedding, doc.metadata ?? {});
                    }
                }

            }
            isRFPProcessed = true;
        }

        await prisma.rfp.update({
            where: { id: data.id },
            data: {
                isRFPProcessed
            }
        })
        const fetchRFP = await prisma.rfp.findFirst({
            where: { id: data.id }
        });
        queues.emailChannel.add("RFP_PROCESSED", {rfpId: data.id, issuedOriganisation: fetchRFP?.orgId})
    } catch (error) {
        logger.error(error);
    }
    
}
