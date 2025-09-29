import { StateGraph, END, Annotation, CompiledStateGraph } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { z } from 'zod'
import { embedding } from "../core/embedding"
import { SystemMessage, HumanMessage, AIMessageChunk } from "@langchain/core/messages";
import { prisma } from "@rfp/shared";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { connectDB } from "../core/db";
import { NodeNames } from "../interfaces/graph";
import fs from "node:fs/promises"

const RouteSchema = z.object({
    step: z.enum(["chatbot", "retriever", "summarize"]).describe(
        "The next step in routing process"
    )
})

type Route = z.infer<typeof RouteSchema>;

const StateAnnotation = Annotation.Root({
    rfpId: Annotation<string>,
    input: Annotation<string>,
    context: Annotation<string[]>,
    decision: Annotation<string>,
    output: Annotation<AIMessageChunk>
})

let agent: CompiledStateGraph<typeof StateAnnotation.State, Partial<typeof StateAnnotation.State>, NodeNames>;

const llm = new ChatOllama({
    model: "llama3.2",
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

const chatbot = async (state: typeof StateAnnotation.State): Promise<Partial<typeof StateAnnotation.State>> => {

    const retieveDocs = await prisma.rFPEmbedding.findMany({
        where: {rfpId: state.rfpId}
    })

    const context = retieveDocs.map(ctx => ctx.content);

    const response = await chain.invoke({
        context: context,
        question: state.input
    })

    console.log(response)

    return { output: response}
}

const summarize = async (state: typeof StateAnnotation.State): Promise<Partial<typeof StateAnnotation.State>> => {
    
    const response = await chain.invoke({
        context: state.context,
        question: state.input
    })

    return {output: response}

}

const router = async (state: typeof StateAnnotation.State): Promise<Partial<typeof StateAnnotation.State>> => {
    console.log("Router:\n\n")
    console.dir(state);
    const decision = await llmRouter.invoke([
        new SystemMessage("Route the input to chatbot, retriever based on the user's request."),
        new HumanMessage(state.input)
    ])

    console.log(decision, "=========")

    return {decision: decision.step }
}

const routerDecision = async (state: typeof StateAnnotation.State)=> {
    if (state.decision === 'chatbot') {
        return "chatbot"
    } else if (state.decision === "retriever") {
        return "retriever"
    } else {
        return "chatbot"
    }
}


async function getAgent(): Promise<CompiledStateGraph<typeof StateAnnotation.State, Partial<typeof StateAnnotation.State>, NodeNames>> {

    try {
        const {client} = await connectDB();
        if(agent) return agent
        const checkpointer = new MongoDBSaver({ client, dbName: "rfp"})

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

        const workflow = new StateGraph(StateAnnotation)
            .addNode("summarize", summarize)
            .addNode("retriever", retriever)
            .addEdge("__start__", "retriever")
            .addEdge("retriever", "summarize")
            .addEdge("summarize", END);
        
        agent = workflow.compile({ checkpointer });

        const drawableGraph = await agent.getGraphAsync()
        const image = await drawableGraph.drawMermaidPng();
        const imageBuffer = new Uint8Array(await image.arrayBuffer())
        
        await fs.writeFile("graph.png", imageBuffer);
        console.log("Graph saved as graph.png");
        return agent;
    } catch (error) {
        throw error;
    }
}

async function talkToRFPAgent(rfpId: string, query: string, thread_id: string) {

    try {
         const _agent = await getAgent();
    for await (const [messages, metadata] of await _agent.stream({
        rfpId: rfpId,
        input: query
    }, {
        // version: "v2",
        configurable: {
            thread_id
        },
        streamMode: "messages",
        runId: thread_id
    })) {
        // if (output.event === "updates") {
        console.dir(messages);
        console.dir(metadata);
        // }
        console.log("==================")
    }
        
    } catch (error) {
        console.error("Error:", error);
    }
    
   
}

export {
    talkToRFPAgent
}








