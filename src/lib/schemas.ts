import { z } from "zod";
import { AUTH } from "./constants";

export const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z
		.string()
		.min(
			AUTH.MIN_PASSWORD_LENGTH,
			`Password must be at least ${AUTH.MIN_PASSWORD_LENGTH} characters`,
		),
});

export const chatMessageSchema = z.object({
	sessionId: z.number().int().positive("Invalid session ID"),
	message: z.string().min(1, "Message is required"),
	ephemeralObjects: z.array(z.unknown()).default([]),
});

export const ephemeralObjectsSchema = z.object({
	ephemeralObjects: z.array(z.unknown()),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type EphemeralObjectsInput = z.infer<typeof ephemeralObjectsSchema>;
