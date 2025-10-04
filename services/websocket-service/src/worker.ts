import { Worker } from "bullmq"
import { RFP_STATUS_UPDATE } from "./utils/constants"

new Worker("INAPP", async (job) => {
    switch (job.name) {
        case RFP_STATUS_UPDATE:
            console.log(job);
        default:
            console.log("default case")
    }
})