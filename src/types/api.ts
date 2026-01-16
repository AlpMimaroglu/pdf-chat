export interface User {
	id: number;
	email: string;
}

export interface Session {
	id: number;
	userId: number;
	ephemeralObjects: unknown[];
	createdAt: string;
	updatedAt: string;
}

export interface Document {
	id: number;
	userId: number;
	filename: string;
	chunkCount: number;
	uploadedAt: string;
}

export interface ChatMessage {
	id: number;
	sessionId: number;
	role: "user" | "assistant";
	content: string;
	sources?: ChatSource[];
	createdAt: string;
}

export interface ChunkMetadata {
	documentId?: number;
	filename?: string;
	chunkIndex?: number;
	pageNumber?: number;
}

export interface ChatSource {
	filename: string;
	content: string;
	chunkIndex?: number;
	pageNumber?: number;
}

export interface ApiError {
	error: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface SessionsResponse {
	sessions: Session[];
}

export interface SessionResponse {
	session: Session;
}

export interface DocumentsResponse {
	documents: Document[];
}

export interface DocumentUploadResponse {
	document: Document;
	chunksProcessed: number;
}

export interface DeleteResponse {
	success: boolean;
}

export interface ChatStreamEvent {
	type: "text" | "sources" | "done";
	text?: string;
	sources?: ChatSource[];
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
}

export interface ChatRequest {
	sessionId: number;
	message: string;
	ephemeralObjects: unknown[];
}

export interface UpdateSessionRequest {
	ephemeralObjects: unknown[];
}
