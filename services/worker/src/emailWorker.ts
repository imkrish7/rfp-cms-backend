import { EMAIL_OTP } from "./interface/email";
import { NEW_RFP } from "./interface/notification";
import { Worker } from "bullmq";
import { sendOTP } from "./services/emailService";
import { connection } from "./core/redis";

new Worker("EMAIL", async job => {
    // console.log("EMAIL", job)
    switch (job.name) {
        case EMAIL_OTP: {
            console.log(job.data, "email worker")
            await sendOTP(job.data)
        }
        case NEW_RFP: {
            // prepare email
            // call emailservice
        }
        default: {
            break;
        }
    }
    
}, {connection})