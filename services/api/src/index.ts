import "dotenv/config";
import express from "express";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";
import { authRouter } from "./routes/auth.js";
import { rfpRouter } from "./routes/rfps.js";
import { proposalRouter } from "./routes/proposals.js";
import { contractRouter } from "./routes/contracts.js";
import { initQueues } from "./core/queue.js";

const app = express();
const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug" });
app.use(pinoHttp({ logger }));
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/rfps", rfpRouter);
app.use("/proposals", proposalRouter);
app.use("/contracts", contractRouter);

const port = Number(process.env.PORT || 3000);
app.listen(port, async () => {
  logger.info(`API listening on :${port}`);
  await initQueues();
});
