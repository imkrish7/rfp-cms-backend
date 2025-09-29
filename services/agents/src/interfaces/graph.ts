export type GraphEventType =
    | "graph_started"
    | "node_started"
    | "node_completed"
    | "error"
    | "stream_chunk"

// export type NodeNames = "__start__" | "chatbot" | "router" | "summarize" | "retriever"
export type NodeNames = "__start__" | "summarize" | "retriever"