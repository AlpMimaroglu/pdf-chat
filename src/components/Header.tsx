import { Link } from "@tanstack/react-router";
import { Home, LogOut, Menu, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../lib/auth-context";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const { user, logout } = useAuth();

	return (
		<>
			<header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
				<div className="flex items-center">
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
						aria-label="Open menu"
					>
						<Menu size={24} />
					</button>
					<h1 className="ml-4 text-xl font-semibold">
						<Link to="/" className="flex items-center gap-2">
							<MessageSquare className="text-cyan-400" />
							<span>PDF Chat</span>
						</Link>
					</h1>
				</div>
				<nav className="hidden md:flex items-center gap-4">
					<Link
						to="/"
						className="px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors"
					>
						Home
					</Link>
					<Link
						to="/chat"
						className="px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors"
					>
						Chat
					</Link>
					{user ? (
						<div className="flex items-center gap-3">
							<span className="text-gray-300 text-sm">{user.email}</span>
							<button
								type="button"
								onClick={logout}
								className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
							>
								<LogOut size={16} />
								Logout
							</button>
						</div>
					) : (
						<Link
							to="/login"
							className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
						>
							Login
						</Link>
					)}
				</nav>
			</header>

			<aside
				className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<h2 className="text-xl font-bold">Navigation</h2>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
						aria-label="Close menu"
					>
						<X size={24} />
					</button>
				</div>

				<nav className="flex-1 p-4 overflow-y-auto">
					<Link
						to="/"
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
					>
						<Home size={20} />
						<span className="font-medium">Home</span>
					</Link>

					<Link
						to="/chat"
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
					>
						<MessageSquare size={20} />
						<span className="font-medium">Chat</span>
					</Link>

					{user ? (
						<button
							type="button"
							onClick={() => {
								logout();
								setIsOpen(false);
							}}
							className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2 w-full text-left"
						>
							<LogOut size={20} />
							<span className="font-medium">Logout</span>
						</button>
					) : (
						<Link
							to="/login"
							onClick={() => setIsOpen(false)}
							className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
						>
							<span className="font-medium">Login</span>
						</Link>
					)}
				</nav>

				{user && (
					<div className="p-4 border-t border-gray-700">
						<p className="text-gray-400 text-sm">Signed in as</p>
						<p className="text-white truncate">{user.email}</p>
					</div>
				)}
			</aside>

			{isOpen && (
				<button
					type="button"
					className="fixed inset-0 bg-black/50 z-40"
					onClick={() => setIsOpen(false)}
					aria-label="Close menu"
				/>
			)}
		</>
	);
}
