import { Router } from "express";
import { prisma } from "../core/db";
import { requireAuth, signJwt } from "../core/auth";
import { EmailVerificationSchema, LoginSchema, ResendEmailVerificationSchema, SignupSchema } from "@rfp/shared"
import { StatusCodes } from "http-status-codes";
import { camparePassword, hashPassword } from "../core/bycrypt";
import { sendOTP } from "../services/emailService";
import { logger } from "../core/logger";
import { generateOTP } from "../utils/otp.utils";
import { AuthUser } from "../interfaces/Auth";
import { queues } from "../core/queue";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {

	try {
		const parsedData = LoginSchema.safeParse(req.body)
		if (parsedData.error) {
			return res.status(401).json({error: "Invalid request"})
		}

		const { email, password } = parsedData.data;

		const user = await prisma.user.findUnique({ where: { email } });
		
		if (!user) return res.status(401).json({ error: "Invalid credentials" });
		
		const ok = await camparePassword(password, user.password);
		
		if (!ok) return res.status(401).json({ error: "Invalid credentials" });

		if (!user.isActivated) {
			return res.status(StatusCodes.ACCEPTED).json({nextStep: "VERIFY_EMAIL"})
		}

		let payload: AuthUser = {
			sub: user.id,
			role: user.role,
			vendorId: null,
			orgId: null
		}
		let nextStep = "COMPLETE_PROFILE"

		if (user.role === "VENDOR") {
			payload["vendorId"] = user.vendorId
			
		} else if (user.role === "PROCUREMENT") {
			payload["orgId"] = user.orgId
		}

		if (user.vendorId || user.orgId) {
			nextStep = "DASHBOARD"
		}

		
		const token = signJwt(payload);
		
		return res.status(StatusCodes.ACCEPTED).json({ accessToken: token, role: user.role, nextStep });
		
	} catch (error) {
		logger.info(error)
		return res.status(500).json({ error: "Internal server error!" });
	}
});


authRouter.post("/signup", async (req, res) => {

	try {
		const parsedData = SignupSchema.safeParse(req.body)
		
		if (parsedData.error) {
			return res.status(401).json({error: "Invalid request"})
		}
		const { email, password, role } = parsedData.data;

		const user = await prisma.user.findUnique({ where: { email } });
		if (user) {
			return res.status(StatusCodes.CONFLICT).json({error: "Email already exist!"})
		}
		// fetch email verification code
		let verificationCode = generateOTP();
		const passwordHash = await hashPassword(password);
		const newUser = await prisma.user.create({
			data: {
				email,
				password: passwordHash,
				role,
				emailVerificationCode: verificationCode
			}
		})
		// Use email service for verification and next step
		// await sendOTP(email, verificationCode);
		await queues.notifications.add("ACTIVATE_ACCOUNT_OTP", {
			to: newUser.email,
			otp: verificationCode
		})
		return res.status(StatusCodes.CREATED).json({message: "Verify your email and complete the next step!"})
	} catch (error) {
		console.log(error)
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error!" });
	}
});


authRouter.post("/verification", async (req, res) => {

	try {
		const parsedData = EmailVerificationSchema.safeParse(req.body)

		if (parsedData.error) {
			return res.status(401).json({error: "Invalid request"})
		}
		const { email, otp } = parsedData.data;
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({error: "User does not exist"})
		}

		if (user.emailVerificationCode !== otp) {
			return res.status(StatusCodes.BAD_REQUEST).json({error: "Invalid OTP!"})
		}

		const update = await prisma.user.update({
			where: { id: user.id },
			data: {
				emailVerificationCode: null,
				isActivated: true
			}
		})
		let payload: AuthUser = {
			sub: user.id,
			role: user.role,
			vendorId: null,
			orgId: null
		}

		let nextStep = "COMPLETE_PROFILE"

		if (user.role === "VENDOR") {
			payload["vendorId"] = user.vendorId
			
		} else if (user.role === "PROCUREMENT") {
			payload["orgId"] = user.orgId
		}

		if (user.vendorId || user.orgId) {
			nextStep = "DASHBOARD"
		}

		const accessToken = await signJwt(payload);

		return res.status(StatusCodes.ACCEPTED).json({accessToken, role: user.role, nextStep })

	} catch (error) {
		logger.error(error)
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error!" });
	}
});


authRouter.post("/verification/resend", async (req, res) => {

	try {
		const parsedData = ResendEmailVerificationSchema.safeParse(req.body)

		if (parsedData.error) {
			return res.status(401).json({error: "Invalid request"})
		}
		const { email } = parsedData.data;
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({error: "User does not exist"})
		}

		const emailVerificationCode = generateOTP()

		const update = await prisma.user.update({
			where: { id: user.id },
			data: {
				emailVerificationCode
			}
		})

		await queues.notifications.add("ACTIVATE_ACCOUNT_OTP", {
			to: user.email,
			otp: emailVerificationCode
		})

		return res.status(StatusCodes.ACCEPTED).json({ message: "Email sent!" })

	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error!" });
	}
});

authRouter.get("/user", requireAuth(["PROCUREMENT", "VENDOR"]), async (req, res) => {
	try {
		const userId = req.user?.sub;

		if (!userId) {
			return res.status(StatusCodes.UNAUTHORIZED).json({error: "Unauthorized"})
		}

		const fetchUser = await prisma.user.findFirst({
			where: { id: userId },
		})

		if (!fetchUser) {
			return res.status(StatusCodes.NOT_FOUND).json({error: "User not found"})
		}

		return res.status(StatusCodes.ACCEPTED).json({email: fetchUser.email})
		
	} catch (error) {
		logger.info(error)
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Internal server error"})
	}
})



authRouter.get("/authenticate", requireAuth(["PROCUREMENT", "VENDOR"]), async (req, res) => {
	try {
		const userId = req.user?.sub;

		if (!userId) {
			return res.status(StatusCodes.UNAUTHORIZED).json({error: "Unauthorized"})
		}

		const user = await prisma.user.findFirst({
			where: { id: userId },
		})

		if (!user) {
			return res.status(StatusCodes.NOT_FOUND).json({error: "User not found"})
		}
			let payload: AuthUser = {
			sub: user.id,
			role: user.role,
			vendorId: null,
			orgId: null
		}
		let nextStep = "COMPLETE_PROFILE"

		if (user.role === "VENDOR") {
			payload["vendorId"] = user.vendorId
			
		} else if (user.role === "PROCUREMENT") {
			payload["orgId"] = user.orgId
		}

		if (user.vendorId || user.orgId) {
			nextStep = "DASHBOARD"
		}

		console.log(payload)

		
		const token = signJwt(payload);
		return res.status(StatusCodes.ACCEPTED).json({accessToken: token, role: user.role, nextStep})
		
	} catch (error) {
		logger.info(error)
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Internal server error"})
	}
})





