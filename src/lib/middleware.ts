import { type JWTPayload, verifyToken } from "./auth";

export function getAuthFromRequest(request: Request): JWTPayload | null {
	const authHeader = request.headers.get("Authorization");

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return null;
	}

	const token = authHeader.slice(7);
	return verifyToken(token);
}

export function requireAuth(request: Request): JWTPayload {
	const auth = getAuthFromRequest(request);

	if (!auth) {
		throw new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	return auth;
}
