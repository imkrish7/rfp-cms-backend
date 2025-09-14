import "dotenv/config";
import { Queue, Worker } from "bullmq";
import { logger } from "./core/logger";
import { connection } from "./core/redis";
import { ACTIVATE_ACCOUNT_OTP, NEW_RFP, PROPOSAL_STATUS_UPDATE, PROPOSAL_SUBMITED } from "./interface/notification";
import { EMAIL_OTP } from "./interface/email";
import "./emailWorker";


const queues = {
	emailChannel: new Queue("EMAIL", { connection }),
	inAppChannel: new Queue("INAPP", { connection })
}


new Worker("processing", async job => {
	logger.info({ jobId: job.id, name: job.name }, "analyzing proposal");
	// TODO: call LLM (OpenAI) and persist results via API/DB
	switch (job.name) {
		case "RFP": {
			
		}
	}
	return { ok: true };
}, { connection });


new Worker("notifications", async job => {
	logger.info({ jobId: job.id, name: job.name, data: job.data }, "sending notification");
	switch (job.name) {
		case NEW_RFP: {
			queues.emailChannel.add("NEW_RFP", job.data);
			queues.inAppChannel.add("INAPP", job.data);
			break;
		}
		case PROPOSAL_STATUS_UPDATE: {
			// sendmail
			queues.emailChannel.add(PROPOSAL_STATUS_UPDATE, job.data);
			// send Notifications
			queues.inAppChannel.add(PROPOSAL_STATUS_UPDATE, job.data);
			break;
		}
		case PROPOSAL_SUBMITED: {
			// sendmail
			queues.emailChannel.add(PROPOSAL_SUBMITED, job.data);
			// send Notifications
			queues.inAppChannel.add(PROPOSAL_SUBMITED, job.data);
			break;
		}
		case ACTIVATE_ACCOUNT_OTP:{
			// sendmail
			queues.emailChannel.add(EMAIL_OTP, job.data);
		}
		default: {
			break;
		}
	}

  return { delivered: true };
}, { connection });


export async function initQueues() {
  await Promise.all(Object.values(queues).map(q => q.waitUntilReady()));
}

logger.info("Worker started");

initQueues().then(() => {
	console.log("Email queue started")
})

