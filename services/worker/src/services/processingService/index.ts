import { prisma } from "@rfp/shared"
export const RFPProcessing = async (data: { id: string }) => {
    
    try {
        const rfp = await prisma.rfp.findFirst({
            where: {id: data.id}
        })
        
    } catch (error) {
        
    }
    
}