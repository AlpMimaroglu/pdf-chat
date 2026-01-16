import { Plus, Trash2 } from "lucide-react";

interface Session {
	id: number;
	ephemeralObjects: unknown[];
	createdAt: string;
}

interface SessionListProps {
	sessions: Session[];
	currentSession: Session | null;
	onSelectSession: (session: Session) => void;
	onCreateSession: () => void;
	onDeleteSession: (id: number) => void;
	userEmail: string;
	onLogout: () => void;
}

export function SessionList({
	sessions,
	currentSession,
	onSelectSession,
	onCreateSession,
	onDeleteSession,
	userEmail,
	onLogout,
}: SessionListProps) {
	return (
		<>
			<div className="p-4 border-b border-slate-700">
				<div className="flex items-center justify-between mb-4">
					<span className="text-gray-300 text-sm">{userEmail}</span>
					<button
						type="button"
						onClick={onLogout}
						className="text-gray-400 hover:text-white text-sm"
					>
						Logout
					</button>
				</div>
				<button
					type="button"
					onClick={onCreateSession}
					className="w-full flex items-center justify-center gap-2 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
				>
					<Plus size={18} /> New Session
				</button>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-2">
				<h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">
					Sessions
				</h3>
				{sessions.map((session) => (
					<button
						key={session.id}
						type="button"
						className={`flex w-full items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
							currentSession?.id === session.id
								? "bg-cyan-500/20 border border-cyan-500/50"
								: "bg-slate-700/50 hover:bg-slate-700"
						}`}
						onClick={() => onSelectSession(session)}
					>
						<span className="text-white text-sm">Session #{session.id}</span>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onDeleteSession(session.id);
							}}
							className="text-gray-400 hover:text-red-400 bg-transparent border-none p-0"
						>
							<Trash2 size={16} />
						</button>
					</button>
				))}
			</div>
		</>
	);
}
