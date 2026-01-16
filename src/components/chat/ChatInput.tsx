import { Send } from "lucide-react";

interface ChatInputProps {
	input: string;
	chatError: string;
	disabled: boolean;
	isStreaming: boolean;
	onChange: (value: string) => void;
	onSend: () => void;
}

export function ChatInput({
	input,
	chatError,
	disabled,
	isStreaming,
	onChange,
	onSend,
}: ChatInputProps) {
	return (
		<div className="p-4 border-t border-slate-700">
			{chatError && (
				<div className="mb-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
					{chatError}
				</div>
			)}
			<div className="flex gap-2">
				<input
					type="text"
					value={input}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
					placeholder="Ask a question..."
					disabled={disabled || isStreaming}
					className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
				/>
				<button
					type="button"
					onClick={onSend}
					disabled={disabled || isStreaming || !input.trim()}
					className="px-4 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white rounded-lg transition-colors"
				>
					<Send size={20} />
				</button>
			</div>
		</div>
	);
}
