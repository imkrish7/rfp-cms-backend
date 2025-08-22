import { Router } from "express";
import { prisma } from "../core/db";
import { requireAuth } from "../core/auth";
import { RfpSchema } from "@rfp/shared";
import { StatusCodes } from "http-status-codes";
import { multerMiddleware } from "../core/multer";
import { v4 as uuid } from "uuid";
import { uploadDocs } from "../services/uploadService";
import { logger } from "../core/logger";

export const rfpRouter = Router();

rfpRouter.get("/", requireAuth(["ADMIN","PROCUREMENT","LEGAL","VENDOR"]), async (req, res) => {
	try {
		const rfps = await prisma.rfp.findMany({ orderBy: { createdAt: "desc" } });
  		return res.json(rfps);
	} catch (error) {
		return res.status(500).json({error: "Internal server error!"})
	}
	
});

rfpRouter.post("/create", requireAuth(["ADMIN","PROCUREMENT"]), multerMiddleware.array("files", 10) ,async (req, res) => {
	const parse = RfpSchema.safeParse(req.body);
	try {
		if (!parse.success) return res.status(StatusCodes.BAD_REQUEST).json(parse.error.flatten());


		let attachments = [];

		if (req.files instanceof Array) {
			for (const file of req.files) {
				const prefix = parse.data.orgId;
				const objectName = `rfp_attachment_${uuid()}`
				const docMetadata = {
					name: file.originalname,
					type: file.mimetype,
					size: file.size
				}

				let _attachment = await uploadDocs(prefix, objectName, file.buffer, docMetadata);

				attachments.push(objectName)
			}
		}
		
		const rfp = await prisma.rfp.create({
			data: { 
				orgId: parse.data.orgId,
				title: parse.data.title,
				description: parse.data.description,
				deadline: new Date(parse.data.deadline),
				attachments: attachments,
				timeline: parse.data.timeline,
				deliverables: parse.data.deliverables,
				issuedBy: parse.data.issuedBy,
				issuedDate: new Date(parse.data.issueDate),
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
		const rfp = await prisma.rfp.findUnique({ where: { id: req.params.id }, include: { proposals: true } });
		
		if (!rfp) return res.status(404).json({ error: "Not found" });
		
		return res.json(rfp);	
	} catch (error) {
		return res.status(500).json({error: "Internal server error!"})
	}
	
});
