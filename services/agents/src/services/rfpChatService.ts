import { StateGraph, END, Annotation, CompiledStateGraph, MemorySaver } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { z } from 'zod'
import { embedding } from "../core/embedding"
import { SystemMessage, HumanMessage, AIMessageChunk, MessageContentComplex } from "@langchain/core/messages";
import { prisma } from "@rfp/shared";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { connectDB } from "../core/db";
import { NodeNames } from "../interfaces/graph";
import { wrapSDK } from "langsmith/wrappers"
import fs from "node:fs/promises"

const RouteSchema = z.object({
    step: z.enum(["chatbot", "retriever", "summarize"]).describe(
        "The next step in routing process"
    )
})

// const wrapper = wrapSDK(ChatOllama)

type Route = z.infer<typeof RouteSchema>;

const StateAnnotation = Annotation.Root({
    rfpId: Annotation<string>,
    input: Annotation<string>,
    context: Annotation<string[]>,
    decision: Annotation<string>,
    output: Annotation<MessageContentComplex[]|string>
})

let agent: CompiledStateGraph<typeof StateAnnotation.State, Partial<typeof StateAnnotation.State>, NodeNames>;

const llm =new ChatOllama({
    model: "llama3.2",
    temperature: 0,
    streaming: true
})
// const llmRouter = llm.withStructuredOutput<Route>(RouteSchema);clear

const systemPrompt = ChatPromptTemplate.fromTemplate(`You are a helpful assistant answering questions based on the uploaded documents.
            Use ONLY the provided context to answer. If question is not relevent to documents you should suggest some question based on documents to users.

            Context:
            {context}

            Question:
            {question}`
)

const chain = systemPrompt.pipe(llm);


const retriever = async (state: typeof StateAnnotation.State): Promise<Partial<typeof StateAnnotation.State>> => {
    const embededQuery = await embedding.embedQuery(state.input);
 
    const collectContext = await prisma.$queryRaw<{id: string, content: string}[]>`
        SELECT id, content
        FROM "RFPEmbedding" WHERE "rfpId"=${state.rfpId}
        ORDER BY embedding <=> ${embededQuery}::vector
        LIMIT 5
    `;

    let context = [...collectContext.map(ctx => ctx.content)]

    return { context }
}

const summarize = async (state: typeof StateAnnotation.State): Promise<typeof StateAnnotation.State> => {
    
    const response = await chain.invoke({
        context: state.context.join(" "),
        question: state.input
    })

    return {...state, output: response.content}

}

async function getAgent(): Promise<CompiledStateGraph<typeof StateAnnotation.State, Partial<typeof StateAnnotation.State>, NodeNames>> {

    try {
        const {client}= await connectDB();
        if (agent) return agent;
const checkpointer = new MongoDBSaver({ client, dbName: "rfp"})
        // const checkpointer = new MemorySaver();

        const workflow = new StateGraph(StateAnnotation)
            .addNode("summarize", summarize)
            .addNode("retriever", retriever)
            .addEdge("__start__", "retriever")
            .addEdge("retriever", "summarize")
            .addEdge("summarize", END);
        
        agent = workflow.compile({ checkpointer });
        
        return agent;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function talkToRFPAgent(rfpId: string, query: string, thread_id: string) {

    try {
         const _agent = await getAgent();
        const events = await _agent.streamEvents({
            rfpId: rfpId,
            input: query
        }, {
            version: "v2",
            configurable: {
                thread_id
            },
            streamMode: "messages",
            runId: thread_id
        })
        return events;    
    } catch (error) {
        console.error("Error:", error);
    }
    
   
}

export {
    talkToRFPAgent,
    agent
}



// ===========================================================================================


        // const workflow = new StateGraph(StateAnnotation)
        //     .addNode("router", router)
        //     .addNode("chatbot", chatbot)
        //     .addNode("summarize", summarize)
        //     .addNode("retriever", retriever)
        //     .addEdge("__start__", "router")
        //     .addEdge("router", "chatbot")
        //     .addEdge("router", "retriever")
        //     .addEdge("retriever", "summarize")
        //     .addEdge("summarize", END)
        //     // .addEdge("chatbot", END)
        //     .addConditionalEdges(
        //         "router", routerDecision
        // );







// const chatbot = async (state: typeof StateAnnotation.State): Promise<Partial<typeof StateAnnotation.State>> => {

//     const retieveDocs = await prisma.rFPEmbedding.findMany({
//         where: {rfpId: state.rfpId}
//     })

//     const context = retieveDocs.map(ctx => ctx.content);

//     const response = await chain.invoke({
//         context: context,
//         question: state.input
//     })

//     console.log(response)

//     return { output: response}
// }



// const router = async (state: typeof StateAnnotation.State): Promise<Partial<typeof StateAnnotation.State>> => {
//     console.log("Router:\n\n")
//     console.dir(state);
//     const decision = await llmRouter.invoke([
//         new SystemMessage("Route the input to chatbot, retriever based on the user's request."),
//         new HumanMessage(state.input)
//     ])

//     console.log(decision, "=========")

//     return {decision: decision.step }
// }

// const routerDecision = async (state: typeof StateAnnotation.State)=> {
//     if (state.decision === 'chatbot') {
//         return "chatbot"
//     } else if (state.decision === "retriever") {
//         return "retriever"
//     } else {
//         return "chatbot"
//     }
// }
