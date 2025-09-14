import { Request, Response, Router } from "express";
import { requireAuth } from "../core/auth";
import { StatusCodes } from "http-status-codes";
import { OrgSchema, prisma } from "@rfp/shared";

export const organisationRouter = Router()

organisationRouter.post("/create", requireAuth(["PROCUREMENT"]), async (req: Request, res: Response) => {
    
    try {

        const validatedData = OrgSchema.safeParse(req.body)

        if (validatedData.error) {
            return res.status(StatusCodes.BAD_REQUEST).json({error: "Data Validation failed!"})
        }

        const { name, logo, description, website } = validatedData.data;
        const userId = req.user?.sub;

        const newOrganisation = await prisma.$transaction(async (tx) => {
            const newOrganisation = await tx.org.create({
                data: {
                    name,
                    logo,
                    website,
                    bio: description
                }
            })

            // associate organisation with user
            const updateUser = await tx.user.update({
                where: { id: userId },
                data: {
                    orgId: newOrganisation.id
                }
            })

            return newOrganisation
        })

        return res.status(StatusCodes.CREATED).json({message: "Organisation created!"})

        
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Internal server error!"})
    }
    
})