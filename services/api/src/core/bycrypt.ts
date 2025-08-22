import bcrypt from "bcryptjs";
import { logger } from "./logger";

const SALT_ROUNDS = 5;

const { compare, hash } = bcrypt;

export const hashPassword = async (password: string): Promise<string> => {
    try {
        const hashedPassword = await hash(password, SALT_ROUNDS);
        return hashedPassword
    } catch (error) {
        logger.error(error)
        throw error;
    }
}

export const camparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    try {
        const validatePassword = await compare(password, hashedPassword);
        return validatePassword;
    } catch (error) {
        return false;
    }
}