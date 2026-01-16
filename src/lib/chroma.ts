import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";
import { ChromaClient } from "chromadb";
import { env } from "../env";
import type { ChunkMetadata } from "../types/api";
import { RAG } from "./constants";

let client: ChromaClient | null = null;

export function getChromaClient() {
	if (!client) {
		const url = new URL(env.CHROMA_URL);
		client = new ChromaClient({
			host: url.hostname,
			port: Number.parseInt(url.port, 10) || 8000,
			ssl: url.protocol === "https:",
		});
	}
	return client;
}

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
	const { embeddings } = await embedMany({
		model: openai.embedding("text-embedding-3-small"),
		values: texts,
	});
	return embeddings;
}

async function generateEmbedding(text: string): Promise<number[]> {
	const { embedding } = await embed({
		model: openai.embedding("text-embedding-3-small"),
		value: text,
	});
	return embedding;
}

export async function getOrCreateCollection() {
	const chromaClient = getChromaClient();

	return chromaClient.getOrCreateCollection({
		name: RAG.COLLECTION_NAME,
		metadata: { "hnsw:space": "cosine" },
	});
}

export async function resetCollection() {
	const chromaClient = getChromaClient();
	try {
		await chromaClient.deleteCollection({ name: RAG.COLLECTION_NAME });
	} catch {
		// Collection doesn't exist, ignore
	}
	return chromaClient.createCollection({
		name: RAG.COLLECTION_NAME,
		metadata: { "hnsw:space": "cosine" },
	});
}

export interface DocumentChunk {
	id: string;
	content: string;
	metadata: {
		documentId: number;
		filename: string;
		chunkIndex: number;
		pageNumber?: number;
	};
}

export async function addDocumentChunks(chunks: DocumentChunk[]) {
	const collection = await getOrCreateCollection();

	const embeddings = await generateEmbeddings(chunks.map((c) => c.content));

	await collection.add({
		ids: chunks.map((c) => c.id),
		documents: chunks.map((c) => c.content),
		metadatas: chunks.map((c) => c.metadata),
		embeddings,
	});
}

export async function searchSimilarChunks(query: string, topK = 5) {
	const collection = await getOrCreateCollection();

	const queryEmbedding = await generateEmbedding(query);

	const results = await collection.query({
		queryEmbeddings: [queryEmbedding],
		nResults: topK,
	});

	return (
		results.documents[0]?.map((doc, i) => ({
			content: doc,
			metadata: results.metadatas[0]?.[i] as ChunkMetadata | undefined,
			distance: results.distances?.[0]?.[i],
		})) || []
	);
}

export async function deleteDocumentChunks(documentId: number) {
	const collection = await getOrCreateCollection();

	await collection.delete({
		where: { documentId },
	});
}
