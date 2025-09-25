import { Router } from "express";
import { requireAuth } from "../core/auth";
import { BatchPresignSchema, ConfirmUploadsSchema, prisma, ProposalSchema, UpdateProposalStatus } from "@rfp/shared";
import { StatusCodes } from "http-status-codes";
import { queues } from "../core/queue.js";
import { multerMiddleware } from "../core/multer";
import { v4 as uuid } from "uuid";
import { objectURL, presignedURL, uploadDocs } from "../services/uploadService";
import { logger } from "../core/logger";
import { createPresignController, createProposalController, proposalStatusUpdateController, scoreProposalController, updateAttachmentStatusController } from "../controllers/proposal.controllers.js";

export const proposalRouter = Router();

proposalRouter.post("/create", requireAuth(["VENDOR"]), createProposalController);

proposalRouter.post("/:id/score", requireAuth(["PROCUREMENT","LEGAL","ADMIN"]), scoreProposalController);

proposalRouter.post("/:id/attachments/presign", requireAuth(["VENDOR"]), createPresignController)


proposalRouter.post("/:id/attachments/confirm", requireAuth(["VENDOR"]), updateAttachmentStatusController)


proposalRouter.post("/:id/update", requireAuth(["VENDOR"]), proposalStatusUpdateController)