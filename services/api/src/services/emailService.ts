import nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"
import { logger } from "../core/logger";

const transportConfig: SMTPTransport.Options = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: process.env.ETHEREAL_USERNAME!,
        pass: process.env.ETHEREAL_PASSWORD!
    }
}

const transporter = nodemailer.createTransport(transportConfig);

export const sendOTP = async (to: string, otp: string) => {
    try {
        const newMail = {
            from: `RFP CMS ${process.env.ETHEREAL_USERNAME!}`,
            to: to,
            subject: 'Email Verification OTP',
            html: `<b>Here is you verification code ${otp}</b>`
        }
        await transporter.sendMail(newMail)
    } catch (error) {
        logger.error(error)
    }
}


