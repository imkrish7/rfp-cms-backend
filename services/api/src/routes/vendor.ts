import { Router } from "express";
import { requireAuth } from "../core/auth";

import { createVendorController } from "../controllers";

export const vendorRouter = Router()

vendorRouter.post("/create", requireAuth(["VENDOR"]), createVendorController)