import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		SERVER_URL: z.string().url().optional(),
		DATABASE_URL: z.string().min(1),
		OPENAI_API_KEY: z.string().min(1),
		JWT_SECRET: z.string().min(32),
		CHROMA_URL: z.string().url().default("http://localhost:8000"),
	},

	clientPrefix: "VITE_",

	client: {
		VITE_APP_TITLE: z.string().min(1).optional(),
	},

	runtimeEnv: {
		...import.meta.env,
		DATABASE_URL: process.env.DATABASE_URL,
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		JWT_SECRET: process.env.JWT_SECRET,
		CHROMA_URL: process.env.CHROMA_URL,
		SERVER_URL: process.env.SERVER_URL,
	},

	emptyStringAsUndefined: true,
});
