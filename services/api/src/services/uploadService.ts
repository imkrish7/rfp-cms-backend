import { logger } from "../core/logger"
import { minioClient } from "../core/minio";

interface DocMetadata {
    name: string,
    type: string,
    size: number
}

export const uploadDocs = async (prefix: string, objectName: string, fileBuffer: Buffer, metadata: DocMetadata) => {
    try {
        let bucketName = process.env.MINIO_BUCKET_NAME!;

        if (!bucketName) {
            throw new Error("Bucket name is required! Please provide a valid bucket name in .env")
        }

        const uploadedObject = await minioClient.putObject(bucketName, `${prefix}/${objectName}`, fileBuffer, metadata.size, metadata);

        return uploadedObject;
    } catch (error) {
        logger.error(`Upload Error: ${error}`)
        throw error;
    }
}