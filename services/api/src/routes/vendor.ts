import { Request, Response, Router } from "express";
import { requireAuth } from "../core/auth";
import { StatusCodes } from "http-status-codes";
import { VendorSchema } from "@rfp/shared";
import { prisma } from "../core/db";

export const organisationRouter = Router()

organisationRouter.post("/vendor/create", requireAuth(["VENDOR"]), async (req: Request, res: Response) => {
    
    try {
        const validatedData = VendorSchema.safeParse(req.body)

        if (validatedData.error) {
            return res.status(StatusCodes.BAD_REQUEST).json({error: "Data Validation failed!"})
        }

        const { name, logo, description, website, userId, contactNumber, contactPerson, gstin, businessCategory } = validatedData.data;

        const newVendor = await prisma.$transaction(async (tx) => {
            const newOrganisation = await tx.vendor.create({
                data: {
                    name,
                    logo,
                    website,
                    contactNumber,
                    contactPerson,
                    userId,
                    gstin,
                    businessCategory,
                    bio: description
                }
            })
            return newOrganisation
        })

        return res.status(StatusCodes.CREATED).json({message: "Vendor created!"})

        
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Internal server error!"})
    }
    
})