import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { chatMessages, sessions } from "../../db/schema";
import { chat } from "../../lib/ai";
import { apiHandler, badRequest, notFound } from "../../lib/api-utils";
import { requireAuth } from "../../lib/middleware";
import { chatMessageSchema } from "../../lib/schemas";

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: apiHandler(async ({ request }) => {
				const auth = requireAuth(request);
				const body = await request.json();
				const result = chatMessageSchema.safeParse(body);

				if (!result.success) {
					return badRequest(result.error.errors[0]?.message || "Invalid input");
				}

				const { sessionId, message, ephemeralObjects } = result.data;

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

				await db.insert(chatMessages).values({
					sessionId,
					role: "user",
					content: message,
				});

				const { stream, sources } = await chat({
					query: message,
					ephemeralObjects,
				});

				let fullResponse = "";
				const textStream = stream.textStream;

				const encoder = new TextEncoder();
				const readableStream = new ReadableStream({
					async start(controller) {
						try {
							controller.enqueue(
								encoder.encode(
									`data: ${JSON.stringify({ type: "sources", sources })}\n\n`,
								),
							);

							for await (const text of textStream) {
								fullResponse += text;
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "text", text })}\n\n`,
									),
								);
							}

							await db.insert(chatMessages).values({
								sessionId,
								role: "assistant",
								content: fullResponse,
								sources,
							});

							controller.enqueue(
								encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
							);
							controller.close();
						} catch (error) {
							console.error("Stream error:", error);
							controller.error(error);
						}
					},
				});

				return new Response(readableStream, {
					headers: {
						"Content-Type": "text/event-stream",
						"Cache-Control": "no-cache",
						Connection: "keep-alive",
					},
				});
			}),
		},
	},
});
