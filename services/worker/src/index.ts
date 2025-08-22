import "dotenv/config";
import { Worker } from "bullmq";
import { Notification } from "./interface/notification";
import { logger } from "./core/logger";
import { sendEmail } from "./services/emailService";

const connection = { url: process.env.REDIS_URL || "redis://127.0.0.1:6379" };

new Worker("analysis", async job => {
	logger.info({ jobId: job.id, name: job.name }, "analyzing proposal");
	// TODO: call LLM (OpenAI) and persist results via API/DB
	return { ok: true };
}, { connection });

new Worker("notifications", async job => {
	logger.info({ jobId: job.id, name: job.name, data: job.data }, "sending notification");
	switch (job.name) {
		case Notification.NEW_RFP: {
			// sendEmails
			break;
		}
		case Notification.PROPOSAL_STATUS_UPDATE: {
			// sendmail
			// send Notifications
			break;
		}
		case Notification.PROPOSAL_SUBMITED: {
			// sendmail
			// sendNotifacations
			break;
		}
		default: {
			break;
		}
	}




  return { delivered: true };
}, { connection });

logger.info("Worker started");
