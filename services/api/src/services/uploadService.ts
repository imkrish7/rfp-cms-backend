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


export const presignedURL = async (filename: string, expiry: number = 300) => {
    try {
        let bucketName = process.env.MINIO_BUCKET_NAME!;
        if (!bucketName) {
            throw new Error("Bucket name is required! Please provide a valid bucket name in .env")
        }
        const presignedURL = await minioClient.presignedPutObject(bucketName, filename, expiry)
        
        return presignedURL
    } catch (error) {
        throw error;
    }
}


export const objectURL = (object: string) => {
    const baseURI = process.env.MINIO_URL;
    const bucket = process.env.MINIO_BUCKET_NAME!;
    if (!baseURI) {
        throw new Error("Minio url is required!")
    }

    if (!bucket) {
        throw new Error("Minio bucket name is required!")
    }

    return `${baseURI}/${bucket}/${object}`
    
}