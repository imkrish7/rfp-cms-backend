import multer from "multer"

export const multerMiddleware = multer({ storage: multer.memoryStorage() });


