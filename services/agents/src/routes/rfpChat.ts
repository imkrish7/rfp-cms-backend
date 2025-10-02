import { Router, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { requireAuth } from "../core/auth";
import { prisma } from "@rfp/shared";
import { talkToRFPAgent } from "../services/rfpChatService";
import { v4 as uuid } from "uuid"
import { SSE_DATA_PREFIX, SSE_LINE_DELIMITER, StreamMessage, StreamMessageType } from "../interfaces/graph";
import { ToolMessage } from "@langchain/core/messages";

const routes = Router()

async function sendSSEMessage(
    writer: Response,
    data: StreamMessage
) {
    const encoder = new TextEncoder()

    return writer.write(
        encoder.encode(`${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`)
    )

}

routes.post("/chat/:rfpId", requireAuth(["VENDOR"]), async (req: Request, res: Response) => {
    console.log("CALLEDDD")
    try {

        const { rfpId } = req.params;
        const { vendorId } = req.user ?? {};
        
        if (!vendorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({"message": "Unauthorized"})
        }

        if (!rfpId) {
            return res.status(StatusCodes.BAD_REQUEST).json({"message": "Bad request"})
        }

        const { query } = req.body;
        console.log(query);

        if (!query) {
            return res.status(StatusCodes.BAD_REQUEST).json({"message": "Query is required!"})
        }


        const isRFPTalkExist = await prisma.rFPTalk.findFirst({
            where: {vendorId, rfpId}
        })
        let threadId = null;
        if (!isRFPTalkExist) {
            threadId = uuid();
            const newRFPTalk = await prisma.rFPTalk.create({
                data: {
                    vendorId,
                    rfpId,
                    threadId
                }
            })
        } else {
            threadId = isRFPTalkExist.threadId;
        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")
        res.flushHeaders();

        const events = await talkToRFPAgent(rfpId, query, threadId);
        try {
            if (events) {
                for await (const event of events) {
                    if (event.event === "on_chat_model_stream") {
                        const token = event.data.chunk;
                        if (token) {
                            const text = token.content;
                            if (text) {
                                await sendSSEMessage(res, {
                                    type: StreamMessageType.Token,
                                    token: text
                                })
                            }
                        }
                    } else if (event.event === "on_tool_start") {
                        await sendSSEMessage(res, {
                            type: StreamMessageType.ToolStart,
                            tool: event.name || 'uknown',
                            input: event.data.input
                        })
                    } else if (event.event === "on_tool_end") {
                        const toolMessage = new ToolMessage(event.data.output);
                        await sendSSEMessage(res, {
                            type: StreamMessageType.ToolEnd,
                            tool: toolMessage.lc_kwargs.name || "uknown",
                            output: event.data.output
                        })
                    }
                }
                await sendSSEMessage(res, {
                    type: StreamMessageType.Done
                })
            }   
        } catch (error) {
            await sendSSEMessage(res, {
                type: StreamMessageType.Error,
                error: error instanceof Error ? error.message : "Error in chat"
         })       
        } finally {
            await res.end()
        }
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "Our server is dead!"})
    }
})

export {
    routes
}
