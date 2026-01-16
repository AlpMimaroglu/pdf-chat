import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { sessions } from "../../db/schema";
import { apiHandler, badRequest, notFound, success } from "../../lib/api-utils";
import { requireAuth } from "../../lib/middleware";
import { ephemeralObjectsSchema } from "../../lib/schemas";

export const Route = createFileRoute("/api/sessions/$sessionId")({
	server: {
		handlers: {
			GET: apiHandler(async ({ request, params }) => {
				const auth = requireAuth(request);
				const sessionId = Number.parseInt(params.sessionId, 10);

				const [session] = await db
					.select()
					.from(sessions)
					.where(
						and(eq(sessions.id, sessionId), eq(sessions.userId, auth.userId)),
					)
					.limit(1);

				if (!session) {
					return notFound("Session not found");
				}

				return success({ session });
			}),

			PUT: apiHandler(async ({ request, params }) => {
				const auth = requireAuth(request);
				const sessionId = Number.parseInt(params.sessionId, 10);
				const body = await request.json();
				const result = ephemeralObjectsSchema.safeParse(body);

				if (!result.success) {
					return badRequest(
						result.error.errors[0]?.message ||
							"ephemeralObjects must be an array",
					);
				}

				const { ephemeralObjects } = result.data;

				const [updated] = await db
					.update(sessions)
					.set({
						ephemeralObjects,
						updatedAt: new Date(),
					})
					.where(
						and(eq(sessions.id, sessionId), eq(sessions.userId, auth.userId)),
					)
					.returning();

				if (!updated) {
					return notFound("Session not found");
				}

				return success({ session: updated });
			}),

			DELETE: apiHandler(async ({ request, params }) => {
				const auth = requireAuth(request);
				const sessionId = Number.parseInt(params.sessionId, 10);

				const [deleted] = await db
					.delete(sessions)
					.where(
						and(eq(sessions.id, sessionId), eq(sessions.userId, auth.userId)),
					)
					.returning();

				if (!deleted) {
					return notFound("Session not found");
				}

				return success({ success: true });
			}),
		},
	},
});
