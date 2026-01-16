import { FileText, Trash2, Upload } from "lucide-react";
import { useRef } from "react";

interface Document {
	id: number;
	filename: string;
	chunkCount: number;
	uploadedAt: string;
}

interface DocumentListProps {
	documents: Document[];
	isUploading: boolean;
	uploadError: string;
	onUpload: (file: File) => void;
	onDelete: (id: number) => void;
}

export function DocumentList({
	documents,
	isUploading,
	uploadError,
	onUpload,
	onDelete,
}: DocumentListProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<div className="p-4 border-t border-slate-700">
			<h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">
				Documents
			</h3>
			<input
				type="file"
				ref={fileInputRef}
				accept=".pdf"
				className="hidden"
				onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
			/>
			<button
				type="button"
				onClick={() => fileInputRef.current?.click()}
				disabled={isUploading}
				className="w-full flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors mb-2"
			>
				<Upload size={18} className={isUploading ? "animate-pulse" : ""} />
				{isUploading ? "Uploading..." : "Upload PDF"}
			</button>
			{uploadError && (
				<p className="text-red-400 text-xs mb-2">{uploadError}</p>
			)}
			<div className="space-y-1 max-h-40 overflow-y-auto">
				{documents.map((doc) => (
					<div
						key={doc.id}
						className="flex items-center justify-between p-2 bg-slate-700/50 rounded text-sm"
					>
						<div className="flex items-center gap-2 text-gray-300 truncate">
							<FileText size={14} />
							<span className="truncate">{doc.filename}</span>
						</div>
						<button
							type="button"
							onClick={() => onDelete(doc.id)}
							className="text-gray-400 hover:text-red-400"
						>
							<Trash2 size={14} />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
