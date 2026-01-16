import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { sessions } from "../../db/schema";
import { apiHandler, success } from "../../lib/api-utils";
import { requireAuth } from "../../lib/middleware";

export const Route = createFileRoute("/api/sessions")({
	server: {
		handlers: {
			GET: apiHandler(async ({ request }) => {
				const auth = requireAuth(request);

				const userSessions = await db
					.select()
					.from(sessions)
					.where(eq(sessions.userId, auth.userId))
					.orderBy(sessions.updatedAt);

				return success({ sessions: userSessions });
			}),

			POST: apiHandler(async ({ request }) => {
				const auth = requireAuth(request);

				const [newSession] = await db
					.insert(sessions)
					.values({
						userId: auth.userId,
						ephemeralObjects: [],
					})
					.returning();

				return success({ session: newSession });
			}),
		},
	},
});
