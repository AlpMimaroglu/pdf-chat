type HandlerContext = {
	request: Request;
	params: Record<string, string>;
};

type HandlerFn = (ctx: HandlerContext) => Promise<Response>;

export function apiHandler(fn: HandlerFn): HandlerFn {
	return async (ctx) => {
		try {
			return await fn(ctx);
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}
			console.error("API error:", error);
			return Response.json({ error: "Internal server error" }, { status: 500 });
		}
	};
}

export function badRequest(message: string): Response {
	return Response.json({ error: message }, { status: 400 });
}

export function unauthorized(message = "Unauthorized"): Response {
	return Response.json({ error: message }, { status: 401 });
}

export function notFound(message = "Not found"): Response {
	return Response.json({ error: message }, { status: 404 });
}

export function conflict(message: string): Response {
	return Response.json({ error: message }, { status: 409 });
}

export function success<T>(data: T): Response {
	return Response.json(data);
}
