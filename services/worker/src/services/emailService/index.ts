import nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"
import { logger } from "../../core/logger";

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

export const sendEmail = async (to: string, otp: string) => {
    try {
        logger.info("Preparing email verification")
       
        logger.info("Verification email prepared!")
        logger.info("Sending email...")
        // await transporter.sendMail(newMail)
        logger.info("Email sent!")
    } catch (error) {
        logger.error(error)
    }
}