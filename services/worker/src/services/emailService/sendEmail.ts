import { transporter } from "../../core/emailTransport"
import { logger } from "../../core/logger"


export const sendEmail = async (to: string, template: string, subject: string) => {
    try {
        const newMail = {
            from: `RFP CMS markus.walter@ethereal.email`,
            to: to,
            subject: subject,
            html: template
        }
        console.log(newMail, "drnfMDKDFGK")
        await transporter.sendMail(newMail)
    } catch (error) {
        logger.error(error)
    }
}
