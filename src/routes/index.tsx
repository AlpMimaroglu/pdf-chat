import { createFileRoute, Link } from "@tanstack/react-router";
import { Database, FileText, MessageSquare, Zap } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const features = [
		{
			icon: <FileText className="w-12 h-12 text-cyan-400" />,
			title: "PDF Document Knowledge",
			description:
				"Upload PDF documents to create a persistent knowledge base. Documents are chunked and embedded for semantic search.",
		},
		{
			icon: <Database className="w-12 h-12 text-cyan-400" />,
			title: "Session Objects",
			description:
				"Define ephemeral JSON objects for each session. The AI can reason over both documents and your dynamic data.",
		},
		{
			icon: <MessageSquare className="w-12 h-12 text-cyan-400" />,
			title: "Hybrid RAG Chat",
			description:
				"Ask questions that combine document knowledge with session-specific objects. Get accurate, contextual answers.",
		},
		{
			icon: <Zap className="w-12 h-12 text-cyan-400" />,
			title: "Real-time Streaming",
			description:
				"Responses stream in real-time with source citations. See exactly which documents informed each answer.",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			<section className="relative py-20 px-6 text-center overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
				<div className="relative max-w-5xl mx-auto">
					<div className="flex items-center justify-center gap-4 mb-6">
						<MessageSquare className="w-16 h-16 text-cyan-400" />
						<h1 className="text-5xl md:text-6xl font-black text-white">
							<span className="text-gray-300">PDF</span>{" "}
							<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
								Chat
							</span>
						</h1>
					</div>
					<p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
						Hybrid RAG System for Document Q&A
					</p>
					<p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
						Combine persistent PDF knowledge with session-specific data. Ask
						questions that span both sources and get intelligent, contextual
						answers with source citations.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link
							to="/chat"
							className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
						>
							Start Chatting
						</Link>
						<Link
							to="/register"
							className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
						>
							Create Account
						</Link>
					</div>
				</div>
			</section>

			<section className="py-16 px-6 max-w-7xl mx-auto">
				<h2 className="text-3xl font-bold text-white text-center mb-12">
					Features
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{features.map((feature) => (
						<div
							key={feature.title}
							className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
						>
							<div className="mb-4">{feature.icon}</div>
							<h3 className="text-xl font-semibold text-white mb-3">
								{feature.title}
							</h3>
							<p className="text-gray-400 leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</section>

			<section className="py-16 px-6 max-w-4xl mx-auto text-center">
				<h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div>
						<div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
							1
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Upload PDFs
						</h3>
						<p className="text-gray-400 text-sm">
							Upload your documents to build a searchable knowledge base
						</p>
					</div>
					<div>
						<div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
							2
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Add Objects
						</h3>
						<p className="text-gray-400 text-sm">
							Define session-specific JSON objects for dynamic context
						</p>
					</div>
					<div>
						<div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
							3
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Ask Questions
						</h3>
						<p className="text-gray-400 text-sm">
							Get answers that combine both knowledge sources
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}
