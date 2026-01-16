import type {
	ApiError,
	AuthResponse,
	DeleteResponse,
	DocumentsResponse,
	DocumentUploadResponse,
	SessionResponse,
	SessionsResponse,
} from "../types/api";

const API_BASE = "";

function getToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("token");
}

export function setToken(token: string): void {
	localStorage.setItem("token", token);
}

export function clearToken(): void {
	localStorage.removeItem("token");
}

export function isAuthenticated(): boolean {
	return !!getToken();
}

async function handleResponse<T>(res: Response): Promise<T> {
	let data: unknown;
	try {
		data = await res.json();
	} catch {
		throw new Error(`Invalid response from server (${res.status})`);
	}

	if (!res.ok) {
		const errorMessage =
			(data as ApiError)?.error || `Request failed (${res.status})`;
		throw new Error(errorMessage);
	}

	return data as T;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
	const token = getToken();
	const headers = new Headers(options.headers);

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const response = await fetch(`${API_BASE}${url}`, {
		...options,
		headers,
	});

	if (response.status === 401) {
		clearToken();
		localStorage.removeItem("user");
		if (typeof window !== "undefined") {
			window.location.href = "/login";
		}
	}

	return response;
}

export const api = {
	auth: {
		async register(
			email: string,
			password: string,
		): Promise<AuthResponse & { error?: string }> {
			const res = await fetch(`${API_BASE}/api/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			return res.json();
		},

		async login(
			email: string,
			password: string,
		): Promise<AuthResponse & { error?: string }> {
			const res = await fetch(`${API_BASE}/api/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			return res.json();
		},
	},

	sessions: {
		async list(): Promise<SessionsResponse> {
			const res = await fetchWithAuth("/api/sessions");
			return handleResponse<SessionsResponse>(res);
		},

		async create(): Promise<SessionResponse> {
			const res = await fetchWithAuth("/api/sessions", { method: "POST" });
			return handleResponse<SessionResponse>(res);
		},

		async get(id: number): Promise<SessionResponse> {
			const res = await fetchWithAuth(`/api/sessions/${id}`);
			return handleResponse<SessionResponse>(res);
		},

		async update(
			id: number,
			ephemeralObjects: unknown[],
		): Promise<SessionResponse> {
			const res = await fetchWithAuth(`/api/sessions/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ephemeralObjects }),
			});
			return handleResponse<SessionResponse>(res);
		},

		async delete(id: number): Promise<DeleteResponse> {
			const res = await fetchWithAuth(`/api/sessions/${id}`, {
				method: "DELETE",
			});
			return handleResponse<DeleteResponse>(res);
		},
	},

	documents: {
		async list(): Promise<DocumentsResponse> {
			const res = await fetchWithAuth("/api/documents");
			return handleResponse<DocumentsResponse>(res);
		},

		async upload(file: File): Promise<DocumentUploadResponse> {
			const formData = new FormData();
			formData.append("file", file);
			const res = await fetchWithAuth("/api/documents", {
				method: "POST",
				body: formData,
			});
			return handleResponse<DocumentUploadResponse>(res);
		},

		async delete(id: number): Promise<DeleteResponse> {
			const res = await fetchWithAuth(`/api/documents/${id}`, {
				method: "DELETE",
			});
			return handleResponse<DeleteResponse>(res);
		},
	},

	chat: {
		async send(
			sessionId: number,
			message: string,
			ephemeralObjects: unknown[],
			onChunk: (text: string) => void,
			onSources: (sources: unknown[]) => void,
			onDone: () => void,
			signal?: AbortSignal,
		) {
			const res = await fetchWithAuth("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sessionId, message, ephemeralObjects }),
				signal,
			});

			if (!res.ok) {
				let errorMessage = `Chat request failed (${res.status})`;
				try {
					const body = await res.json();
					if (body?.error) errorMessage = body.error;
				} catch {
					// Ignore JSON parse errors
				}
				throw new Error(errorMessage);
			}

			const reader = res.body?.getReader();
			if (!reader) throw new Error("No response stream available");

			const decoder = new TextDecoder();
			let buffer = "";

			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");

					// Keep the last potentially incomplete line in the buffer
					buffer = lines.pop() || "";

					for (const line of lines) {
						if (line.startsWith("data: ")) {
							try {
								const data = JSON.parse(line.slice(6));
								if (data.type === "text") {
									onChunk(data.text);
								} else if (data.type === "sources") {
									onSources(data.sources);
								} else if (data.type === "done") {
									onDone();
								}
							} catch {
								// Ignore invalid JSON lines
							}
						}
					}
				}

				// Process any remaining data in buffer
				if (buffer.startsWith("data: ")) {
					try {
						const data = JSON.parse(buffer.slice(6));
						if (data.type === "text") {
							onChunk(data.text);
						} else if (data.type === "sources") {
							onSources(data.sources);
						} else if (data.type === "done") {
							onDone();
						}
					} catch {
						// Ignore invalid JSON
					}
				}
			} finally {
				reader.releaseLock();
			}
		},
	},
};
