import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ChatInput,
	DocumentList,
	MessageList,
	ObjectEditor,
	SessionList,
} from "../components/chat";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import type { ChatSource, Document, Session } from "../types/api";

export const Route = createFileRoute("/chat")({ component: ChatPage });

interface Message {
	role: "user" | "assistant";
	content: string;
	sources?: ChatSource[];
}

function ChatPage() {
	const navigate = useNavigate();
	const { user, isLoading: authLoading, logout } = useAuth();
	const [sessions, setSessions] = useState<Session[]>([]);
	const [currentSession, setCurrentSession] = useState<Session | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [documents, setDocuments] = useState<Document[]>([]);
	const [objectsJson, setObjectsJson] = useState("[]");
	const [objectsError, setObjectsError] = useState("");
	const [showSidebar, setShowSidebar] = useState(true);
	const [chatError, setChatError] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState("");
	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		if (!authLoading && !user) {
			navigate({ to: "/login" });
		}
	}, [user, authLoading, navigate]);

	useEffect(() => {
		const loadSessions = async () => {
			const result = await api.sessions.list();
			setSessions(result.sessions || []);
			if (result.sessions?.length > 0) {
				setCurrentSession(result.sessions[0]);
				setMessages([]);
				setObjectsJson(
					JSON.stringify(result.sessions[0].ephemeralObjects || [], null, 2),
				);
			}
		};

		const loadDocuments = async () => {
			const result = await api.documents.list();
			setDocuments(result.documents || []);
		};

		if (user) {
			loadSessions();
			loadDocuments();
		}
	}, [user]);

	const selectSession = (session: Session) => {
		setCurrentSession(session);
		setMessages([]);
		setObjectsJson(JSON.stringify(session.ephemeralObjects || [], null, 2));
	};

	const createSession = async () => {
		const result = await api.sessions.create();
		if (result.session) {
			setSessions([...sessions, result.session]);
			selectSession(result.session);
		}
	};

	const deleteSession = async (id: number) => {
		await api.sessions.delete(id);
		setSessions(sessions.filter((s) => s.id !== id));
		if (currentSession?.id === id) {
			setCurrentSession(null);
			setMessages([]);
		}
	};

	const saveObjects = async () => {
		if (!currentSession) return;
		setObjectsError("");

		try {
			const parsed = JSON.parse(objectsJson);
			if (!Array.isArray(parsed)) {
				setObjectsError("Must be an array");
				return;
			}
			await api.sessions.update(currentSession.id, parsed);
			setCurrentSession({ ...currentSession, ephemeralObjects: parsed });
		} catch {
			setObjectsError("Invalid JSON");
		}
	};

	const uploadDocument = async (file: File) => {
		setIsUploading(true);
		setUploadError("");
		try {
			const result = await api.documents.upload(file);
			if (result.document) {
				setDocuments([...documents, result.document]);
			}
		} catch (error) {
			setUploadError(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setIsUploading(false);
		}
	};

	const deleteDocument = async (id: number) => {
		await api.documents.delete(id);
		setDocuments(documents.filter((d) => d.id !== id));
	};

	const cancelChat = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
		setIsStreaming(false);
	}, []);

	useEffect(() => {
		return () => {
			cancelChat();
		};
	}, [cancelChat]);

	const sendMessage = async () => {
		if (!input.trim() || !currentSession || isStreaming) return;

		const userMessage: Message = { role: "user", content: input };
		const assistantMessage: Message = {
			role: "assistant",
			content: "",
			sources: [],
		};

		setMessages((prev) => [...prev, userMessage, assistantMessage]);
		const currentInput = input;
		setInput("");
		setIsStreaming(true);
		setChatError("");

		abortControllerRef.current = new AbortController();

		let currentObjects: unknown[] = [];
		try {
			currentObjects = JSON.parse(objectsJson);
		} catch {
			currentObjects = [];
		}

		try {
			await api.chat.send(
				currentSession.id,
				currentInput,
				currentObjects,
				(text) => {
					setMessages((prev) => {
						const updated = prev.slice(0, -1);
						const last = prev[prev.length - 1];
						if (last.role === "assistant") {
							return [...updated, { ...last, content: last.content + text }];
						}
						return prev;
					});
				},
				(sources) => {
					setMessages((prev) => {
						const updated = prev.slice(0, -1);
						const last = prev[prev.length - 1];
						if (last.role === "assistant") {
							return [
								...updated,
								{ ...last, sources: sources as Message["sources"] },
							];
						}
						return prev;
					});
				},
				() => setIsStreaming(false),
				abortControllerRef.current.signal,
			);
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				return;
			}
			console.error("Chat error:", error);
			setChatError(error instanceof Error ? error.message : "Chat failed");
			setIsStreaming(false);
		}
	};

	if (authLoading) {
		return (
			<div className="min-h-screen bg-slate-900 flex items-center justify-center">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-900 flex">
			{showSidebar && (
				<div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
					<ErrorBoundary>
						<SessionList
							sessions={sessions}
							currentSession={currentSession}
							onSelectSession={selectSession}
							onCreateSession={createSession}
							onDeleteSession={deleteSession}
							userEmail={user?.email || ""}
							onLogout={logout}
						/>
						<DocumentList
							documents={documents}
							isUploading={isUploading}
							uploadError={uploadError}
							onUpload={uploadDocument}
							onDelete={deleteDocument}
						/>
					</ErrorBoundary>
				</div>
			)}

			<div className="flex-1 flex flex-col">
				<div className="flex items-center p-4 border-b border-slate-700">
					<button
						type="button"
						onClick={() => setShowSidebar(!showSidebar)}
						className="text-gray-400 hover:text-white mr-4"
					>
						<ChevronRight
							size={20}
							className={showSidebar ? "rotate-180" : ""}
						/>
					</button>
					<h1 className="text-white font-semibold">PDF Chat with RAG</h1>
				</div>

				<div className="flex-1 flex">
					<div className="flex-1 flex flex-col">
						<ErrorBoundary>
							<MessageList messages={messages} />
						</ErrorBoundary>
						<ChatInput
							input={input}
							chatError={chatError}
							disabled={!currentSession}
							isStreaming={isStreaming}
							onChange={setInput}
							onSend={sendMessage}
						/>
					</div>

					<ErrorBoundary>
						<ObjectEditor
							objectsJson={objectsJson}
							objectsError={objectsError}
							disabled={!currentSession}
							onChange={setObjectsJson}
							onSave={saveObjects}
						/>
					</ErrorBoundary>
				</div>
			</div>
		</div>
	);
}
