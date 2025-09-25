import { StateGraph, END, START, Annotation, addMessages } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { z } from 'zod'
import { embedding } from "../core/embedding"
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { prisma } from "@rfp/shared";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { MongoClient } from "mongodb";


const RouteSchema = z.object({
    step: z.enum(["chatbot", "retriever"]).describe(
        "The next step in routing process"
    )
})

type Route = z.infer<typeof RouteSchema>;

const llm = new ChatOllama({
    model: "llama3.3",
})
const llmRouter = llm.withStructuredOutput<Route>(RouteSchema);
const systemPrompt = ChatPromptTemplate.fromTemplate(`You are a helpful assistant answering questions based on the uploaded documents.
            Use ONLY the provided context to answer. If question is not relevent to documents you should suggest some question on documents.

            Context:
            {context}

            Question:
            {question}`
)

const chain = systemPrompt.pipe(llm);

const StateAnnotation = Annotation.Root({
    rfpId: Annotation<string>,
    input: Annotation<string>,
    context: Annotation<string[]>,
    decision: Annotation<string>,
    output: Annotation<string>
})

const retriever = async (state: typeof StateAnnotation.State) => {
    const embededQuery = embedding.embedQuery(state.input);

    const collectContext = await prisma.$queryRaw<{id: string, content: string}[]>`
        SELECT id, content
        FROM "RFPEmbedding" WHERE rfpId=${state.rfpId}
        ORDER BY embedding <=> ${embededQuery}::vector
        LIMIT 5
    `;

    let context = [...collectContext.map(ctx => ctx.content)]
    return { context }

}

const chatbot = async (state: typeof StateAnnotation.State) => {

    const response = llm.invoke([
        new SystemMessage(`You are a helpful assistant answering questions based on the uploaded documents.
            If question is not relevent to documents you should suggest some question on documents.`),
        new HumanMessage(state.input)
    ])
    return { output: response}
}

const summarize = async (state: typeof StateAnnotation.State) => {
    
    const response = await chain.invoke({
        context: state.context,
        question: state.input
    })

    return {output: response}

}

const router = async (state: typeof StateAnnotation.State) => {
    const decision = await llmRouter.invoke([
        new SystemMessage("Route the input to chatbot, retriever based on the user's request."),
        new HumanMessage(state.input)
    ])

    return { decision: decision.step }
}

const routerDecision = async (state: typeof StateAnnotation.State) => {
    if (state.decision === 'chatbot') {
        return "chatbot"
    } else if (state.decision === "retriever") {
        return "retriever"
    } else {
        return "chatbot"
    }
}


async function talkToRFPAgent(client: MongoClient, query: string, thread_id: string) {
    
    const checkpointer = new MongoDBSaver({client, dbName: "rfp"})

    const workflow = new StateGraph(StateAnnotation)
        .addNode("router", router)
        .addNode("chatbot", chatbot)
        .addNode("summarize", summarize)
        .addNode("retriever", retriever)
        .addEdge(START, "router")
        .addEdge("retriever", "summarize")
        .addEdge("summarize", END)
        .addEdge("chatbot", END)
        .addConditionalEdges(
            "router", routerDecision
    );
    
    const app = workflow.compile({ checkpointer });
    
    const response = await app.invoke({
        input: query
    }, {
        configurable: { thread_id },
        recursionLimit: 15
    })

    return response.output
}

export {
    talkToRFPAgent
}








