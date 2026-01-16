import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import type { ChatSource, ChunkMetadata } from "../types/api";
import { searchSimilarChunks } from "./chroma";
import { RAG } from "./constants";

const SYSTEM_PROMPT = `You are an intelligent assistant that helps users by answering questions based on two sources of information:

1. **Document Knowledge**: Information retrieved from uploaded PDF documents. This is persistent knowledge that provides context, rules, regulations, or reference material.

2. **Session Objects**: A dynamic list of objects provided by the user for the current session. These are ephemeral, session-specific data points that may represent items, drawings, entities, or any structured data the user wants to analyze.

When answering questions:
- Consider both the document knowledge and session objects together
- If a question relates to the session objects, analyze them in the context of any relevant rules or information from the documents
- Be precise and cite specific information from the documents when relevant
- When analyzing session objects, be specific about which objects you're referring to
- If you cannot find relevant information in either source, clearly state that

Format your responses clearly and concisely. When referencing document sources, indicate which document the information came from.`;

export interface ChatContext {
	query: string;
	ephemeralObjects: unknown[];
	topK?: number; // defaults to RAG.DEFAULT_TOP_K
}

export interface RetrievedChunk {
	content: string;
	metadata?: ChunkMetadata;
	distance?: number;
}

export interface ChatResult {
	stream: ReturnType<typeof streamText>;
	sources: ChatSource[];
}

export async function chat(context: ChatContext): Promise<ChatResult> {
	const { query, ephemeralObjects, topK = RAG.DEFAULT_TOP_K } = context;

	const retrievedChunks = await searchSimilarChunks(query, topK);

	const documentContext =
		retrievedChunks.length > 0
			? `## Retrieved Document Context\n\n${retrievedChunks
					.map(
						(chunk, i) =>
							`### Source ${i + 1} (${chunk.metadata?.filename || "Unknown"})\n${chunk.content}`,
					)
					.join("\n\n")}`
			: "## Retrieved Document Context\n\nNo relevant documents found.";

	const objectsContext =
		ephemeralObjects.length > 0
			? `## Session Objects\n\n\`\`\`json\n${JSON.stringify(ephemeralObjects, null, 2)}\n\`\`\``
			: "## Session Objects\n\nNo session objects provided.";

	const fullPrompt = `${documentContext}\n\n${objectsContext}\n\n## User Question\n\n${query}`;

	const result = streamText({
		model: openai("gpt-4o-mini"),
		system: SYSTEM_PROMPT,
		prompt: fullPrompt,
	});

	return {
		stream: result,
		sources: retrievedChunks.map((chunk) => ({
			filename: chunk.metadata?.filename ?? "Unknown",
			content: chunk.content || "",
			chunkIndex: chunk.metadata?.chunkIndex,
			pageNumber: chunk.metadata?.pageNumber,
		})),
	};
}
