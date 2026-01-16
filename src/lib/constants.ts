export const AUTH = {
	JWT_EXPIRY: "7d",
	MIN_PASSWORD_LENGTH: 6,
	BCRYPT_ROUNDS: 12,
} as const;

export const PDF = {
	CHUNK_SIZE: 1000,
	CHUNK_OVERLAP: 200,
	MIN_CHUNK_LENGTH: 50,
	MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
	MAX_CHUNKS: 500,
} as const;

export const RAG = {
	DEFAULT_TOP_K: 5,
	COLLECTION_NAME: "pdf_documents",
} as const;
