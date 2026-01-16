import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { documents } from "../../db/schema";
import { apiHandler, notFound, success } from "../../lib/api-utils";
import { deleteDocumentChunks } from "../../lib/chroma";
import { requireAuth } from "../../lib/middleware";

export const Route = createFileRoute("/api/documents/$documentId")({
	server: {
		handlers: {
			DELETE: apiHandler(async ({ request, params }) => {
				const auth = requireAuth(request);
				const documentId = Number.parseInt(params.documentId, 10);

				const [deleted] = await db
					.delete(documents)
					.where(
						and(
							eq(documents.id, documentId),
							eq(documents.userId, auth.userId),
						),
					)
					.returning();

				if (!deleted) {
					return notFound("Document not found");
				}

				await deleteDocumentChunks(documentId);

				return success({ success: true });
			}),
		},
	},
});
