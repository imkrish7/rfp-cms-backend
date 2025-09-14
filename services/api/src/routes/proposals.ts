import { Router } from "express";
import { requireAuth } from "../core/auth";
import { BatchPresignSchema, ConfirmUploadsSchema, prisma, ProposalSchema, UpdateProposalStatus } from "@rfp/shared";
import { StatusCodes } from "http-status-codes";
import { queues } from "../core/queue.js";
import { multerMiddleware } from "../core/multer";
import { v4 as uuid } from "uuid";
import { objectURL, presignedURL, uploadDocs } from "../services/uploadService";
import { logger } from "../core/logger";

export const proposalRouter = Router();

proposalRouter.post("/create", requireAuth(["VENDOR"]), async (req, res) => {
    const parsed = ProposalSchema.safeParse(req.body);
    try {
        logger.info(parsed.error)
        if (!parsed.success) return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
        
        const p = parsed.data;

        const vendorId = req.user?.vendorId!;
        
        const proposal = await prisma.proposal.create({
            data: {
                rfpId: p.rfpId,
                vendorId: vendorId,
                cost: p.cost,
                description: p.description,
                title: p.title,
                status: "DRAFT"
            }
        });
        // await queues.analysis.add("analyze-proposal", { proposalId: proposal.id }, { removeOnComplete: true, attempts: 3 });
        
		return res.status(StatusCodes.CREATED).json(proposal);
    } catch (error) {
        logger.error(error);
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

proposalRouter.post("/:id/attachments/presign", requireAuth(["VENDOR"]), async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(StatusCodes.FORBIDDEN).json({error: "Invalid request"})
        }
        const validateRequest = BatchPresignSchema.safeParse(req.body);

        if (!validateRequest.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Bad Request" });
        }

        const proposal = await prisma.proposal.findUnique({ where: { id } });

        if (!proposal) {
            return res.status(StatusCodes.NOT_FOUND).json({error: "Proposal not found"})
        }

        if (proposal.status !== "DRAFT" && proposal.status === "RESUBMIT") {
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({error: "Not Allowed"})
        }

        const presignedURLs = await Promise.all(
            validateRequest.data.files.map(async (file) => {
                const filepath = uuid();
                const objectName = `proposals/${id}/${filepath}/${file.filename}`;
                const uploadUrl = await presignedURL(objectName, 300);
                const finalURL = objectURL(objectName);

                await prisma.attachment.create({
                    data: {
                        proposalId: id,
                        filename: file.filename,
                        filetype: file.mimeType,
                        size: file.size,
                        associatedTo: "PROPOSAL",
                        status: "PENDING",
                        fileurl: finalURL,
                        fileId: filepath
                    }
                })

                return {fileId: filepath, filename: file.filename, uploadUrl, finalURL}
            })
        )

        return res.status(StatusCodes.CREATED).json({uploads: presignedURLs})

    } catch (error) {

        logger.error(error)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Internal server error"})
        
    }
})


proposalRouter.post("/:id/attachments/confirm", requireAuth(["VENDOR"]), async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(StatusCodes.FORBIDDEN).json({error: "Invalid request"})
        }
        const validateRequest = ConfirmUploadsSchema.safeParse(req.body);

        if (!validateRequest.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Bad Request" });
        }

        const proposal = await prisma.proposal.findUnique({ where: { id } });

        if (!proposal) {
            return res.status(StatusCodes.NOT_FOUND).json({error: "Proposal not found"})
        }

        if (proposal.status !== "DRAFT") {
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({error: "Not Allowed"})
        }

        await Promise.all(
            validateRequest.data.files.map(async (file) => {
                await prisma.attachment.updateMany({
                    where: {fileId: file.fileId, rfpId: id},
                    data: {
                        status: file.status,
                    }
                })
            })
        )

        const attachments = await prisma.attachment.findMany({where: {proposalId: id}})

        return res.status(StatusCodes.CREATED).json({attachments})

    } catch (error) {
        logger.error(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Internal server error"})
    }
})


proposalRouter.post("/:id/update", requireAuth(["VENDOR"]), async (req, res) => {
    
     try {
         const validateData = UpdateProposalStatus.safeParse(req.body);
        if (!validateData.success) return res.status(StatusCodes.BAD_REQUEST).json(validateData.error.flatten());
        
        const {status} = validateData.data;

         const vendorId = req.user?.vendorId!;
         const proposalId = req.params.id;
        
         const proposal = await prisma.proposal.findFirst({
            where: {id: proposalId, vendorId}
         })
         
        if (proposal) {
             return res.status(StatusCodes.NOT_FOUND).json({error: "Proposal not found"})
        }
        
         const proposalUpdate = await prisma.proposal.update({
             where: { id: proposalId },
             data: {
                 status: status=== "SUBMIT" ? "SUBMITTED" : "UNDER_REVIEW"
             }
         })
         
         if (status === "SUBMIT") {
             await queues.notifications.add("PROPOSAL_SUBMITTED", { proposalId}, { removeOnComplete: true, attempts: 3 });
         }
		return res.status(StatusCodes.CREATED).json(proposal);
    } catch (error) {
        logger.error(error);
        return res.status(500).json({error: "Internal server error!"})
    }
})