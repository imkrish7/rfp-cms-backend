import { Request, Response, Router } from "express";
import { requireAuth } from "../core/auth";
import { createOrganisationController } from "../controllers";

export const organisationRouter = Router()

organisationRouter.post("/create", requireAuth(["PROCUREMENT"]), createOrganisationController)