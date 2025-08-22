import { Router } from "express";
import { prisma } from "../core/db";
import { requireAuth } from "../core/auth";
import { ProposalSchema } from "@rfp/shared";
import { StatusCodes } from "http-status-codes";
import { queues } from "../core/queue.js";
import { multerMiddleware } from "../core/multer";
import { v4 as uuid } from "uuid";
import { uploadDocs } from "../services/uploadService";

export const proposalRouter = Router();

proposalRouter.post("/create", requireAuth(["VENDOR"]), multerMiddleware.array("files", 10), async (req, res) => {
    const parsed = ProposalSchema.safeParse(req.body);
    try {
        if (!parsed.success) return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
        
        const p = parsed.data;

        let attachments = [];
        
        if (req.files instanceof Array) {
            for (const file of req.files) {
                const prefix = parsed.data.rfpId;
                const objectName = `proposal_attachment_${uuid()}`
                const docMetadata = {
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size
                }

                let _attachment = await uploadDocs(prefix, objectName, file.buffer, docMetadata);

                attachments.push(objectName)
            }
        }

        const vendorId = req.user?.vendorId!;
        
        const proposal = await prisma.proposal.create({
            data: {
                rfpId: p.rfpId,
                vendorId: vendorId,
                price: p.price,
                summary: p.summary,
                attachments: attachments,
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
