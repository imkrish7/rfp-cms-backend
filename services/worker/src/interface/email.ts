export const EMAIL_OTP = "EMAIL_OTP"

export interface IOTPMail {
    otp: string;
}

export interface IOTPData extends IOTPMail{
    to: string
} 

export interface IEmailData<TData>{
    subject: string;
    heading: string;
    username: string;
    content: TData;
    expiryMinutes: number;
    bodyText: string;
    companyName: string;
    year: string;
}