import { prisma, VendorSchema } from "@rfp/shared";
import { logger } from "../core/logger";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express"

export const createVendorController = async (req: Request, res: Response) => {
    
    try {
        const validatedData = VendorSchema.safeParse(req.body)

        if (validatedData.error) {
            return res.status(StatusCodes.BAD_REQUEST).json({error: "Data Validation failed!"})
        }

        const { name, logo, description, website, contactEmail, contactPerson, gstin, businessCategory } = validatedData.data;

        const userId = req.user?.sub!

        const _newVendor = await prisma.$transaction(async (tx) => {
            const newOrganisation = await tx.vendor.create({
                data: {
                    name,
                    logo,
                    website,
                    contactEmail,
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
    
}