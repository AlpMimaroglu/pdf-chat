import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-[400px] flex items-center justify-center p-8">
					<div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
						<AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-white mb-2">
							Something went wrong
						</h2>
						<p className="text-gray-400 mb-6">
							An unexpected error occurred. Please try again.
						</p>
						{this.state.error && (
							<details className="mb-6 text-left">
								<summary className="text-gray-500 cursor-pointer hover:text-gray-400 text-sm">
									Error details
								</summary>
								<pre className="mt-2 p-3 bg-slate-900 rounded text-red-400 text-xs overflow-auto max-h-32">
									{this.state.error.message}
								</pre>
							</details>
						)}
						<button
							type="button"
							onClick={this.handleReset}
							className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
						>
							<RefreshCw size={18} />
							Try Again
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

interface PageErrorBoundaryProps {
	children: ReactNode;
}

export function PageErrorBoundary({ children }: PageErrorBoundaryProps) {
	return (
		<ErrorBoundary
			fallback={
				<div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
					<div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
						<AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-white mb-2">
							Page Error
						</h2>
						<p className="text-gray-400 mb-6">
							This page encountered an error and cannot be displayed.
						</p>
						<a
							href="/"
							className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
						>
							Return Home
						</a>
					</div>
				</div>
			}
		>
			{children}
		</ErrorBoundary>
	);
}
