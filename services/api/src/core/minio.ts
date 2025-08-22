import * as Minio from "minio";

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT! ,
    port: parseInt(process.env.MINIO_PORT!) || 9000,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
})

