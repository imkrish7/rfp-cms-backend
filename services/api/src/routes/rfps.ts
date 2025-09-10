import { Router } from "express";
import { prisma } from "../core/db";
import { requireAuth } from "../core/auth";
import { BatchPresignSchema, ConfirmRFPSchema, ConfirmUploadsSchema, RfpSchema } from "@rfp/shared";
import { StatusCodes } from "http-status-codes";
import { multerMiddleware } from "../core/multer";
import { v4 as uuid } from "uuid";
import { objectURL, presignedURL, uploadDocs } from "../services/uploadService";
import { logger } from "../core/logger";
import { minioClient } from "../core/minio";
import { queues } from "../core/queue";

export const rfpRouter = Router();

rfpRouter.get("/", requireAuth(["ADMIN","PROCUREMENT","LEGAL","VENDOR"]), async (req, res) => {
	try {
		const orgId = req.user?.orgId;
		if (!orgId && req.user?.role==="PROCUREMENT") {
			return res.status(StatusCodes.UNAUTHORIZED).json({error: "unauthorized"})
		}
		let rfps;
		if (orgId) {
			rfps = await prisma.rfp.findMany({ where: { orgId }, orderBy: { createdAt: "desc" } });
		} else {
			rfps = await prisma.rfp.findMany({ where: {status: "PUBLISHED"}, orderBy: { createdAt: "desc" } })
		}
  		return res.status(StatusCodes.ACCEPTED).json({rfps});
	} catch (error) {
		return res.status(500).json({error: "Internal server error!"})
	}
	
});

rfpRouter.post("/create", requireAuth(["ADMIN","PROCUREMENT"]), multerMiddleware.array("files", 10) ,async (req, res) => {
	const parse = RfpSchema.safeParse(req.body);
	try {
		if (!parse.success) return res.status(StatusCodes.BAD_REQUEST).json(parse.error.flatten());
		const orgId = req.user?.orgId;
		
		const rfp = await prisma.rfp.create({
			data: { 
				orgId: orgId!,
				title: parse.data.title,
				description: parse.data.description,
				deadline: new Date(parse.data.deadline),
				timeline: parse.data.timeline,
				deliverables: parse.data.deliverables,
				issuedBy: parse.data.issuedBy,
				issuedDate: new Date(),
				status: parse.data.status,
				scopeOfWork: parse.data.scopeOfWork,
				evaluationCriteria: parse.data.evaluationCriteria,
			}
		});
		
		return res.status(StatusCodes.CREATED).json({ data: rfp });
	} catch (error) {
		logger.error(error)
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Internal server error!"})
	}
 
  
});

rfpRouter.get("/:id", requireAuth(), async (req, res) => {
	try {
		const rfp = await prisma.rfp.findUnique({ where: { id: req.params.id }, include: { proposals: true, attachments: true } });
		if (!rfp) return res.status(404).json({ error: "Not found" });
		
		return res.status(StatusCodes.ACCEPTED).json(rfp);	
	} catch (error) {
		return res.status(500).json({error: "Internal server error!"})
	}
	
});

rfpRouter.post("/:id/attachments/presign", requireAuth(["PROCUREMENT"]), async (req, res) => {
	try {
		
		const id = req.params.id;
		
		if (!id) {
			return res.status(StatusCodes.FORBIDDEN).json({error: "Invalid request"})
		}
		const validateRequest = BatchPresignSchema.safeParse(req.body);

		if (!validateRequest.success) {
			return res.status(StatusCodes.BAD_REQUEST).json({ error: "Bad Request" });
		}

		const rfp = await prisma.rfp.findUnique({ where: { id } });

		if (!rfp) {
			return res.status(StatusCodes.NOT_FOUND).json({error: "Proposal not found"})
		}

		if (rfp.status !== "DRAFT") {
			return res.status(StatusCodes.NOT_ACCEPTABLE).json({error: "Not Allowed"})
		}
		console.log(minioClient, "krissjsjjfsdfl")
		const presignedURLs = await Promise.all(
			validateRequest.data.files.map(async (file) => {
				const filepath = uuid();
				const objectName = `rfp/${id}/${filepath}/${file.filename}`;
				const uploadUrl = await presignedURL(objectName, 300);
				const finalUrl = objectURL(objectName);

				await prisma.attachment.create({
					data: {
						rfpId: id,
						filename: file.filename,
						filetype: file.mimeType,
						size: file.size,
						associatedTo: "RFP",
						status: "PENDING",
						fileurl: finalUrl,
						fileId: filepath
					}
				})

				return {fileId: filepath, filename: file.filename, uploadUrl, finalUrl}
			})
		)

		return res.status(StatusCodes.CREATED).json({uploads: presignedURLs})

	} catch (error) {
		logger.error(error)
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Internal server error"})
	}
})


rfpRouter.post("/:id/attachments/confirm", requireAuth(["PROCUREMENT"]), async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(StatusCodes.FORBIDDEN).json({error: "Invalid request"})
		}
		const validateRequest = ConfirmUploadsSchema.safeParse(req.body);

		if (!validateRequest.success) {
			return res.status(StatusCodes.BAD_REQUEST).json({ error: "Bad Request" });
		}

		const rfp = await prisma.rfp.findUnique({ where: { id } });

		if (!rfp) {
			return res.status(StatusCodes.NOT_FOUND).json({error: "Proposal not found"})
		}

		if (rfp.status !== "DRAFT") {
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

		const attachments = await prisma.attachment.findMany({where: {rfpId: id}})

		return res.status(StatusCodes.CREATED).json({attachments})

	} catch (error) {
		logger.error(error)
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Internal server error"})
	}
})



rfpRouter.post("/:id/submit", requireAuth(["PROCUREMENT"]), async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(StatusCodes.FORBIDDEN).json({error: "Invalid request"})
		}
		const validateRequest = ConfirmRFPSchema.safeParse(req.body);
		// console.
		if (!validateRequest.success) {
			return res.status(StatusCodes.BAD_REQUEST).json({ error: "Bad Request" });
		}

		
		const rfp = await prisma.rfp.findUnique({ where: { id } });

		if (!rfp) {
			return res.status(StatusCodes.NOT_FOUND).json({error: "Proposal not found"})
		}

		if (rfp.status !== "DRAFT") {
			return res.status(StatusCodes.NOT_ACCEPTABLE).json({error: "Not Allowed"})
		}

		const updatedRFP = await prisma.rfp.update({
			where: { id },
			data: {
				status: validateRequest.data.status
			}
		})

		if (validateRequest.data.status === "PUBLISHED") {
			const vendors = await prisma.vendor.findMany();
			for (const vendor of vendors) {
				queues.notifications.add("new_rfp",{
					to: {
						"email": vendor.contactNumber,
						"id": vendor.id
					},
					message: `<b>New ${rfp.title} has been published`
				})
			}

		}
		
		return res.status(StatusCodes.CREATED).json({rfp: updatedRFP})

	} catch (error) {
		logger.error(error)
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Internal server error"})
	}
})



rfpRouter.delete("/:id", requireAuth(["PROCUREMENT"]), async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(StatusCodes.FORBIDDEN).json({error: "Invalid request"})
		}
		
		const rfp = await prisma.rfp.findUnique({ where: { id } });

		if (!rfp) {
			return res.status(StatusCodes.NOT_FOUND).json({error: "Proposal not found"})
		}

		const updatedRFP = await prisma.rfp.delete({
			where: { id },
			include: {
				proposals: true,
				attachments: true,
				contracts: true
			}
		})
		
		return res.status(StatusCodes.CREATED).json({message: "RFP deleted successfully"})

	} catch (error) {
		logger.error(error)
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Internal server error"})
	}
})



