import { Router } from "express";
import { requireAuth } from "../core/auth";
import { getAuthenticateController, getUserController, loginController, signupController, verificationController } from "../controllers";

export const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.post("/signup", signupController);
authRouter.post("/verification", verificationController);
authRouter.post("/verification/resend", verificationController);
authRouter.get("/user", requireAuth(["PROCUREMENT", "VENDOR"]), getUserController)
authRouter.get("/authenticate", requireAuth(["PROCUREMENT", "VENDOR"]),getAuthenticateController)





