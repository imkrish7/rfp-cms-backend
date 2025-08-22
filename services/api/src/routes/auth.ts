import { Router } from "express";
import { prisma } from "../core/db";
import { signJwt } from "../core/auth";
import { EmailVerificationSchema, LoginSchema, ResendEmailVerificationSchema, SignupSchema } from "@rfp/shared"
import { StatusCodes } from "http-status-codes";
import { camparePassword, hashPassword } from "../core/bycrypt";
import { sendOTP } from "../services/emailService";
import { logger } from "../core/logger";
import { generateOTP } from "../utils/otp.utils";
import { AuthUser } from "../interfaces/Auth";

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

		let payload: AuthUser = {
			sub: user.id,
			role: user.role,
			vendorId: null,
			orgId: null
		}

		if (user.role === "VENDOR") {
			payload["vendorId"] = user.vendorId
		} else if (user.role === "PROCUREMENT") {
			payload["orgId"] = user.orgId
		}
		
		const token = signJwt(payload);
		
		return res.status(StatusCodes.ACCEPTED).json({ token, role: user.role });
		
	} catch (error) {
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
		await sendOTP(email, verificationCode);
		return res.status(StatusCodes.CREATED).json({message: "Verify your email and complete the next step!"})
	} catch (error) {
		console.log(error)
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error!" });
	}
});


authRouter.post("/email/verification", async (req, res) => {

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

		const auth_token = await signJwt({ sub: user.id, role: user.role });

		const nextStep = "details"

		return res.status(StatusCodes.ACCEPTED).json({auth_token, role: user.role, nextStep })

	} catch (error) {
		logger.error(error)
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error!" });
	}
});


authRouter.post("/email/verification/resend", async (req, res) => {

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

		await sendOTP(user.email, emailVerificationCode)

		return res.status(StatusCodes.ACCEPTED).json({ message: "Email sent!" })

	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error!" });
	}
});


