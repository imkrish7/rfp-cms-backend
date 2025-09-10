import nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"


const transportConfig: SMTPTransport.Options = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: "markus.walter@ethereal.email",//process.env.ETHEREAL_USERNAME!,
        pass: "VesU1E6MnhZpKdJhC8"
    }
}

export const transporter = nodemailer.createTransport(transportConfig);