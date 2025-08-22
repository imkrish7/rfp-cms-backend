import { Request, Response, Router } from "express";
import { requireAuth } from "../core/auth";
import { StatusCodes } from "http-status-codes";
import { VendorSchema } from "@rfp/shared";
import { prisma } from "../core/db";
import { logger } from "../core/logger";

export const vendorRouter = Router()

vendorRouter.post("/create", requireAuth(["VENDOR"]), async (req: Request, res: Response) => {
    
    try {
        const validatedData = VendorSchema.safeParse(req.body)

        if (validatedData.error) {
            logger.error(validatedData.error)
            return res.status(StatusCodes.BAD_REQUEST).json({error: "Data Validation failed!"})
        }

        const { name, logo, description, website, contactNumber, contactPerson, gstin, businessCategory } = validatedData.data;

        const userId = req.user?.sub!

        const _newVendor = await prisma.$transaction(async (tx) => {
            const newOrganisation = await tx.vendor.create({
                data: {
                    name,
                    logo,
                    website,
                    contactNumber,
                    contactPerson,
                    gstin,
                    businessCategory,
                    bio: description
                }
            })

            await tx.user.update({
                where: { id: userId },
                data: {
                    vendorId: newOrganisation.id
                }
            })
            return newOrganisation
        })

        return res.status(StatusCodes.CREATED).json({message: "Vendor created!"})

        
    } catch (error) {
        logger.error(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Internal server error!"})
    }
    
})