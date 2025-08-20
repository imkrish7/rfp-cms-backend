import { Router } from "express";
import { prisma } from "../core/db";
import { requireAuth } from "../core/auth";
import { ProposalSchema } from "@rfp/shared";
import { StatusCodes } from "http-status-codes";
import { queues } from "../core/queue.js";

export const proposalRouter = Router();

proposalRouter.post("/", requireAuth(["VENDOR"]), async (req, res) => {
    const parsed = ProposalSchema.safeParse(req.body);
    try {
        if (!parsed.success) return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
        
        const p = parsed.data;
        
        const proposal = await prisma.proposal.create({
            data: {
                rfpId: p.rfpId, vendorId: p.vendorId, price: p.price, summary: p.summary, attachments: p.attachments
            }
        });
        await queues.analysis.add("analyze-proposal", { proposalId: proposal.id }, { removeOnComplete: true, attempts: 3 });
        
		return res.status(StatusCodes.CREATED).json(proposal);
    } catch (error) {
        return res.status(500).json({error: "Internal server error!"})
    }
   
});

proposalRouter.post("/:id/score", requireAuth(["PROCUREMENT","LEGAL","ADMIN"]), async (req, res) => {
	const { score } = req.body as { score: number };
	try {
		const updated = await prisma.proposal.update({ where: { id: req.params.id }, data: { score } });
		
		return res.json(updated);
	} catch (error) {
		return res.status(500).json({error: "Internal server error!"})	
	}
	
});
