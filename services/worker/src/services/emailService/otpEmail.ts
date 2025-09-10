import { IEmailData, IOTPData, IOTPMail } from "../../interface/email";
import { prepareTemplate } from "./prepareTemplate";
import { sendEmail } from "./sendEmail";

export const prepareOTPEmail = (data: Partial<IEmailData<IOTPMail>>) => {
    const templateName = "otp_template"
    let emailData: IEmailData<IOTPMail> = {
        ...data,
        subject: "Email Verification Code",
        heading: "🔐 Verify Your Email",
        username: data.username!,
        bodyText: "Use the following One-Time Password (OTP) to verify your email address:",
        content: data.content!,
        expiryMinutes: 10,
        companyName: "Procurer.",
        year: new Date().getFullYear().toLocaleString(),
    }

    const html = prepareTemplate(templateName, emailData);

    return html
}

export const sendOTP = async (data: IOTPData) => {
    const subject = "Email Verification Code"
    
    const prepareEmail = await prepareOTPEmail({ username: data.to, content: { otp: data.otp } });
    
    await sendEmail(data.to, prepareEmail!, subject)
}

