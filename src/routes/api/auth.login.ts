import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import {
	apiHandler,
	badRequest,
	success,
	unauthorized,
} from "../../lib/api-utils";
import { generateToken, verifyPassword } from "../../lib/auth";
import { loginSchema } from "../../lib/schemas";

export const Route = createFileRoute("/api/auth/login")({
	server: {
		handlers: {
			POST: apiHandler(async ({ request }) => {
				const body = await request.json();
				const result = loginSchema.safeParse(body);

				if (!result.success) {
					return badRequest(result.error.errors[0]?.message || "Invalid input");
				}

				const { email, password } = result.data;

				const [user] = await db
					.select()
					.from(users)
					.where(eq(users.email, email))
					.limit(1);

				if (!user) {
					return unauthorized("Invalid email or password");
				}

				const isValidPassword = await verifyPassword(
					password,
					user.passwordHash,
				);

				if (!isValidPassword) {
					return unauthorized("Invalid email or password");
				}

				const token = generateToken({ userId: user.id, email: user.email });

				return success({
					user: { id: user.id, email: user.email },
					token,
				});
			}),
		},
	},
});
