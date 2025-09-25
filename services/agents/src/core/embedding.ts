import { OllamaEmbeddings } from "@langchain/ollama";

const embedding = new OllamaEmbeddings({
    model: "embeddinggemma",
})

export {
    embedding
}