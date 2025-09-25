import { ContractSchema, prisma } from "@rfp/shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { queues } from "../core/queue";

export const createContractController = async (req: Request, res: Response) => {
	const parsed = ContractSchema.safeParse(req.body);
	
	try {
		if (!parsed.success) return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
		
		const c = parsed.data;
		
		const contract = await prisma.contract.create({ data: { ...c } as any });
		
		await queues.notifications.add("contract-created", { contractId: contract.id }, { removeOnComplete: true });
		
		return res.status(StatusCodes.CREATED).json(contract);
	} catch (error) {
		return res.status(500).json({error: "Internal Server error!"})
	}
}

export const contractStatusUpdateContoller = async (req: Request, res: Response) => {
	const { status } = req.body as { status: "DRAFT"|"NEGOTIATION"|"SIGNED" };
	try {
		const updated = await prisma.contract.update({ where: { id: req.params.id }, data: { status } });
		return res.json(updated);
	} catch (error) {
		return res.status(500).json({error: "Internal server error!"})
	}
	
}