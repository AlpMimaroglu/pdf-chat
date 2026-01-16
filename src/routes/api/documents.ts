import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { documents } from "../../db/schema";
import { apiHandler, badRequest, success } from "../../lib/api-utils";
import { addDocumentChunks, type DocumentChunk } from "../../lib/chroma";
import { PDF } from "../../lib/constants";
import { requireAuth } from "../../lib/middleware";
import { generateChunkId, parsePDF, splitIntoChunks } from "../../lib/pdf";

export const Route = createFileRoute("/api/documents")({
	server: {
		handlers: {
			GET: apiHandler(async ({ request }) => {
				const auth = requireAuth(request);

				const userDocs = await db
					.select()
					.from(documents)
					.where(eq(documents.userId, auth.userId))
					.orderBy(documents.uploadedAt);

				return success({ documents: userDocs });
			}),

			POST: apiHandler(async ({ request }) => {
				const auth = requireAuth(request);

				const formData = await request.formData();
				const file = formData.get("file") as File | null;

				if (!file) {
					return badRequest("No file uploaded");
				}

				if (file.type !== "application/pdf") {
					return badRequest("Only PDF files are allowed");
				}

				if (file.size > PDF.MAX_FILE_SIZE) {
					return badRequest("File size exceeds 20MB limit");
				}

				const buffer = Buffer.from(await file.arrayBuffer());
				const parsed = await parsePDF(buffer);
				let chunks = splitIntoChunks(parsed.text);

				if (chunks.length > PDF.MAX_CHUNKS) {
					chunks = chunks.slice(0, PDF.MAX_CHUNKS);
				}

				const [doc] = await db
					.insert(documents)
					.values({
						userId: auth.userId,
						filename: file.name,
						chunkCount: chunks.length,
					})
					.returning();

				const chromaChunks: DocumentChunk[] = chunks.map((content, index) => ({
					id: generateChunkId(doc.id, index),
					content,
					metadata: {
						documentId: doc.id,
						filename: doc.filename,
						chunkIndex: index,
					},
				}));

				await addDocumentChunks(chromaChunks);

				return success({
					document: doc,
					chunksProcessed: chunks.length,
				});
			}),
		},
	},
});
