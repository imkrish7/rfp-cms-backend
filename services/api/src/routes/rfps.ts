import { Router } from "express";
import { prisma } from "../core/db";
import { requireAuth } from "../core/auth";
import { RfpSchema } from "@rfp/shared";
import { StatusCodes } from "http-status-codes";

export const rfpRouter = Router();

rfpRouter.get("/", requireAuth(["ADMIN","PROCUREMENT","LEGAL","VENDOR"]), async (req, res) => {
	try {
		const rfps = await prisma.rfp.findMany({ orderBy: { createdAt: "desc" } });
  		return res.json(rfps);
	} catch (error) {
		return res.status(500).json({error: "Internal server error!"})
	}
	
});

rfpRouter.post("/", requireAuth(["ADMIN","PROCUREMENT"]), async (req, res) => {
	const parse = RfpSchema.safeParse(req.body);
	try {
		if (!parse.success) return res.status(StatusCodes.BAD_REQUEST).json(parse.error.flatten());
		
		const rfp = await prisma.rfp.create({
			data: { 
			orgId: parse.data.orgId,
			title: parse.data.title,
			description: parse.data.description,
			deadline: new Date(parse.data.deadline),
			attachments: parse.data.attachments
			}
		});
		
		return res.status(StatusCodes.CREATED).json(rfp);
	} catch (error) {
		return res.status(500).json({error: "Internal server error!"})
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
