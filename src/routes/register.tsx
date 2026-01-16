import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useId, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth-context";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const emailId = useId();
	const passwordId = useId();
	const confirmPasswordId = useId();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setIsLoading(true);

		try {
			const result = await api.auth.register(email, password);

			if (result.error) {
				setError(result.error);
				return;
			}

			login(result.user, result.token);
			navigate({ to: "/chat" });
		} catch {
			setError("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
			<div className="w-full max-w-md">
				<h1 className="text-3xl font-bold text-white text-center mb-8">
					Create Account
				</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded">
							{error}
						</div>
					)}

					<div>
						<label
							htmlFor={emailId}
							className="block text-sm font-medium text-gray-300 mb-1"
						>
							Email
						</label>
						<input
							id={emailId}
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
							placeholder="you@example.com"
						/>
					</div>

					<div>
						<label
							htmlFor={passwordId}
							className="block text-sm font-medium text-gray-300 mb-1"
						>
							Password
						</label>
						<input
							id={passwordId}
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
							placeholder="••••••••"
						/>
					</div>

					<div>
						<label
							htmlFor={confirmPasswordId}
							className="block text-sm font-medium text-gray-300 mb-1"
						>
							Confirm Password
						</label>
						<input
							id={confirmPasswordId}
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
							placeholder="••••••••"
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-semibold rounded-lg transition-colors"
					>
						{isLoading ? "Creating account..." : "Create Account"}
					</button>
				</form>

				<p className="mt-6 text-center text-gray-400">
					Already have an account?{" "}
					<Link to="/login" className="text-cyan-400 hover:text-cyan-300">
						Sign In
					</Link>
				</p>
			</div>
		</div>
	);
}
