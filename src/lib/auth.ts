import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../env";
import { AUTH } from "./constants";

function getJwtSecret(): string {
	return env.JWT_SECRET;
}

export interface JWTPayload {
	userId: number;
	email: string;
}

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, AUTH.BCRYPT_ROUNDS);
}

export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
	return jwt.sign(payload, getJwtSecret(), { expiresIn: AUTH.JWT_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
	try {
		return jwt.verify(token, getJwtSecret()) as JWTPayload;
	} catch {
		return null;
	}
}
