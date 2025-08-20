import "dotenv/config";
import { Worker } from "bullmq";
import pino from "pino";

const logger = pino();
const connection = { url: process.env.REDIS_URL || "redis://127.0.0.1:6379" };

new Worker("analysis", async job => {
  logger.info({ jobId: job.id, name: job.name }, "analyzing proposal");
  // TODO: call LLM (OpenAI) and persist results via API/DB
  return { ok: true };
}, { connection });

new Worker("notifications", async job => {
  logger.info({ jobId: job.id, name: job.name, data: job.data }, "sending notification");
  // TODO: deliver email/Slack
  return { delivered: true };
}, { connection });

logger.info("Worker started");
