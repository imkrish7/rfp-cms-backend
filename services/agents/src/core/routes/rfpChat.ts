import { Router, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { requireAuth } from "../auth";
import { prisma } from "@rfp/shared";
import { talkToRFPAgent } from "../../services/rfpChatService";

const routes = Router()
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

        if (!query) {
            return res.status(StatusCodes.BAD_REQUEST).json({"message": "Query is required!"})
        }


        const isRFPTalkExist = await prisma.rFPTalk.findFirst({
            where: {vendorId, rfpId}
        })
        let threadId = null;
        if (!isRFPTalkExist) {
            const rfpIdSplit = rfpId.split("-")[0];
            const vendorIdSplit = vendorId.split("-");
            threadId = rfpIdSplit[rfpIdSplit.length - 1] + vendorIdSplit[vendorIdSplit.length - 1];
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

        // res.setHeader("Content-Type", "text/event-stream");
        // res.setHeader("Cache-Control", "no-cache")
        // res.setHeader("Connection", "keep-alive")
        // res.flushHeaders();

        // const stream = new TransformStream({}, { highWaterMark: 1024 });
        // const writer = stream.writable.getWriter();

        while (true) {

            const chatStream = await talkToRFPAgent(rfpId, query, threadId);
            // const output = await chatStream.next();
            // if (await output.done) {
            //     break;
            // }

            // for (const [key, value] of Object.entries(output)) {
            //     console.log(key)
            //     console.log(value);
            // }

            console.log("=============================")
        
        }


        return res.status(StatusCodes.ACCEPTED).json("test successfull")
        
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "Our server is dead!"})
    }
    
})

export {
    routes
}
