import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../core/db.js";
import { signJwt } from "../core/auth.js";
import { LoginSchema, SignupSchema } from "@rfp/shared"
import { StatusCodes } from "http-status-codes";

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
		
		const ok = await bcrypt.compare(password, user.password);
		
		if (!ok) return res.status(401).json({ error: "Invalid credentials" });
		
		const token = signJwt({ sub: user.id, role: user.role, orgId: user.orgId });
		
		return res.json({ token, role: user.role });
		
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

		let verificationCode = '2356'

		const newUser = await prisma.user.create({
			data: {
				email,
				password,
				role,
				emailVerificationCode: verificationCode
			}
		})
		// Use email service for verification and next step
		// todo
		return res.status(StatusCodes.CREATED).json({message: "Verify your email and complete the next step!"})
	} catch (error) {
		return res.status(500).json({ error: "Internal server error!" });
	}
});
