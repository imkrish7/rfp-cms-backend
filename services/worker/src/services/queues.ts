import { Queue } from "bullmq";
import { connection } from "../core/redis";

export const queues = {
    emailChannel: new Queue("EMAIL", { connection }),
    inAppChannel: new Queue("INAPP", { connection }),   
}
