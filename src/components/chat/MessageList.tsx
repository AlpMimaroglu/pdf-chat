import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatSource } from "../../types/api";

interface Message {
	role: "user" | "assistant";
	content: string;
	sources?: ChatSource[];
}

interface MessageListProps {
	messages: Message[];
}

interface SourceItemProps {
	source: ChatSource;
	index: number;
}

function SourceItem({ source, index }: SourceItemProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const locationLabel = [
		source.pageNumber != null && `Page ${source.pageNumber}`,
		source.chunkIndex != null && `Chunk ${source.chunkIndex + 1}`,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<div className="bg-slate-800 rounded-lg overflow-hidden">
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full flex items-center gap-2 p-3 text-left hover:bg-slate-700/50 transition-colors"
			>
				{isExpanded ? (
					<ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
				) : (
					<ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
				)}
				<FileText size={16} className="text-cyan-400 flex-shrink-0" />
				<div className="flex-1 min-w-0">
					<span className="text-cyan-400 text-sm font-medium truncate block">
						{source.filename || `Source ${index + 1}`}
					</span>
					{locationLabel && (
						<span className="text-gray-500 text-xs">{locationLabel}</span>
					)}
				</div>
				{!isExpanded && (
					<span className="text-gray-500 text-xs flex-shrink-0">
						Click to expand
					</span>
				)}
			</button>

			{isExpanded && (
				<div className="border-t border-slate-700">
					<div className="p-3 max-h-64 overflow-y-auto">
						<p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
							{source.content}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

export function MessageList({ messages }: MessageListProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	});

	return (
		<div className="flex-1 overflow-y-auto p-4 space-y-4">
			{messages.length === 0 && (
				<div className="text-center text-gray-400 mt-20">
					<p className="text-xl mb-2">Start a conversation</p>
					<p className="text-sm">Upload PDFs and ask questions about them</p>
				</div>
			)}
			{messages.map((msg, i) => (
				<div
					key={`message-${msg.role}-${i}`}
					className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
				>
					<div
						className={`max-w-[80%] p-4 rounded-lg ${
							msg.role === "user"
								? "bg-cyan-500 text-white"
								: "bg-slate-700 text-gray-100"
						}`}
					>
						<p className="whitespace-pre-wrap">{msg.content}</p>
						{msg.sources && msg.sources.length > 0 && (
							<div className="mt-4 pt-3 border-t border-slate-600">
								<p className="text-xs text-gray-400 mb-3 font-medium">
									Sources ({msg.sources.length})
								</p>
								<div className="space-y-2">
									{msg.sources.map((source, j) => (
										<SourceItem
											key={`source-${source.filename}-${source.chunkIndex ?? j}`}
											source={source}
											index={j}
										/>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			))}
			<div ref={messagesEndRef} />
		</div>
	);
}
