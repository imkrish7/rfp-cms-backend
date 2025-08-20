import { Queue } from "bullmq";

const connection = { url: process.env.REDIS_URL || "redis://127.0.0.1:6379" };

export const queues = {
  analysis: new Queue("analysis", { connection }),
  notifications: new Queue("notifications", { connection }),
};

export async function initQueues() {
  await Promise.all(Object.values(queues).map(q => q.waitUntilReady()));
}
