import { PDFParse } from "pdf-parse";
import { PDF } from "./constants";

export interface ParsedPDF {
	text: string;
	numPages: number;
}

export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
	const parser = new PDFParse({ data: new Uint8Array(buffer) });
	const textResult = await parser.getText();
	const infoResult = await parser.getInfo();

	await parser.destroy();

	return {
		text: textResult.text,
		numPages: infoResult.total,
	};
}

export function splitIntoChunks(text: string): string[] {
	const chunks: string[] = [];
	const sentences = text.split(/(?<=[.!?])\s+/);

	let currentChunk = "";

	for (const sentence of sentences) {
		if (currentChunk.length + sentence.length > PDF.CHUNK_SIZE) {
			if (currentChunk) {
				chunks.push(currentChunk.trim());
			}
			const overlapStart = Math.max(0, currentChunk.length - PDF.CHUNK_OVERLAP);
			currentChunk = `${currentChunk.slice(overlapStart)} ${sentence}`;
		} else {
			currentChunk += (currentChunk ? " " : "") + sentence;
		}
	}

	if (currentChunk.trim()) {
		chunks.push(currentChunk.trim());
	}

	return chunks.filter((chunk) => chunk.length > PDF.MIN_CHUNK_LENGTH);
}

export function generateChunkId(
	documentId: number,
	chunkIndex: number,
): string {
	return `doc_${documentId}_chunk_${chunkIndex}`;
}
