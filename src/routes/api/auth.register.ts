import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { apiHandler, badRequest, conflict, success } from "../../lib/api-utils";
import { generateToken, hashPassword } from "../../lib/auth";
import { registerSchema } from "../../lib/schemas";

export const Route = createFileRoute("/api/auth/register")({
	server: {
		handlers: {
			POST: apiHandler(async ({ request }) => {
				const body = await request.json();
				const result = registerSchema.safeParse(body);

				if (!result.success) {
					return badRequest(result.error.errors[0]?.message || "Invalid input");
				}

				const { email, password } = result.data;

				const existingUser = await db
					.select()
					.from(users)
					.where(eq(users.email, email))
					.limit(1);

				if (existingUser.length > 0) {
					return conflict("Email already registered");
				}

				const passwordHash = await hashPassword(password);

				const [newUser] = await db
					.insert(users)
					.values({ email, passwordHash })
					.returning({ id: users.id, email: users.email });

				const token = generateToken({
					userId: newUser.id,
					email: newUser.email,
				});

				return success({
					user: { id: newUser.id, email: newUser.email },
					token,
				});
			}),
		},
	},
});
