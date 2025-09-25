import { Router } from "express";
import { requireAuth } from "../core/auth";

import { createRFPController, deleteRFPController, getAllRFPController, getRFPAttachmentPresignsController, getRFPByIdController, rfpAttachmentsStatusUpdateController, rfpSubmitController, } from "../controllers";

export const rfpRouter = Router();

rfpRouter.get("/", requireAuth(["ADMIN", "PROCUREMENT", "LEGAL", "VENDOR"]), getAllRFPController);

rfpRouter.post("/create", requireAuth(["ADMIN","PROCUREMENT"]), createRFPController);

rfpRouter.get("/:id", requireAuth(), getRFPByIdController)

rfpRouter.post("/:id/attachments/presign", requireAuth(["PROCUREMENT"]),getRFPAttachmentPresignsController)


rfpRouter.post("/:id/attachments/confirm", requireAuth(["PROCUREMENT"]), rfpAttachmentsStatusUpdateController)



rfpRouter.post("/:id/submit", requireAuth(["PROCUREMENT"]), rfpSubmitController)



rfpRouter.delete("/:id", requireAuth(["PROCUREMENT"]), deleteRFPController)



