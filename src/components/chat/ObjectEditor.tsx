interface ObjectEditorProps {
	objectsJson: string;
	objectsError: string;
	disabled: boolean;
	onChange: (value: string) => void;
	onSave: () => void;
}

export function ObjectEditor({
	objectsJson,
	objectsError,
	disabled,
	onChange,
	onSave,
}: ObjectEditorProps) {
	return (
		<div className="w-80 border-l border-slate-700 p-4 flex flex-col">
			<h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">
				Session Objects (JSON)
			</h3>
			<textarea
				value={objectsJson}
				onChange={(e) => onChange(e.target.value)}
				className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
				placeholder="[]"
			/>
			{objectsError && (
				<p className="text-red-400 text-sm mt-1">{objectsError}</p>
			)}
			<button
				type="button"
				onClick={onSave}
				disabled={disabled}
				className="mt-2 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 text-white rounded-lg transition-colors"
			>
				Save Objects
			</button>
		</div>
	);
}
