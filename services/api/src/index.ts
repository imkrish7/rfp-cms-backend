import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { rfpRouter } from "./routes/rfps";
import { proposalRouter } from "./routes/proposals";
import { contractRouter } from "./routes/contracts";
import { initQueues } from "./core/queue";
import { loggerMiddleware, logger } from "./core/logger";
import { organisationRouter } from "./routes/organisation";
import { vendorRouter } from "./routes/vendor";

const app = express();

app.use(loggerMiddleware);
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/rfps", rfpRouter);
app.use("/proposals", proposalRouter);
app.use("/contracts", contractRouter);
app.use("/organisation", organisationRouter)
app.use("/vendor", vendorRouter)

const port = Number(process.env.PORT || 5000);
app.listen(port, async () => {
  logger.info(`API listening on :${port}`);
  await initQueues();
});
