import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { clearToken, setToken } from "./api";

interface User {
	id: number;
	email: string;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	login: (user: User, token: string) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		const token = localStorage.getItem("token");

		if (storedUser && token) {
			setUser(JSON.parse(storedUser));
		}
		setIsLoading(false);
	}, []);

	const login = (user: User, token: string) => {
		setUser(user);
		setToken(token);
		localStorage.setItem("user", JSON.stringify(user));
	};

	const logout = () => {
		setUser(null);
		clearToken();
		localStorage.removeItem("user");
	};

	return (
		<AuthContext.Provider value={{ user, isLoading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
