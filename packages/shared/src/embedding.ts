import { logger } from "./core/logger"
import ollama from "ollama";

export const embedContent = async (input: string) => {

    try {
        const embedding = await ollama.embed({
            model: "embeddinggemma",
            input
        })

        return embedding.embeddings[0];
        
    } catch (error) {
        logger.info(error);
    }
    
}