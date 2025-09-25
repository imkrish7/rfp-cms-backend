import { Router } from "express";
import { requireAuth } from "../core/auth.js";
import { contractStatusUpdateContoller, createContractController } from "../controllers";

export const contractRouter = Router();

contractRouter.post("/", requireAuth(["LEGAL","ADMIN","PROCUREMENT"]), createContractController);

contractRouter.post("/:id/status", requireAuth(["LEGAL","ADMIN","PROCUREMENT"]), contractStatusUpdateContoller);
