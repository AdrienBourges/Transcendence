import { z } from "zod";

export const updateMeSchema = z.object({
	avatarUrl: z.url().optional(),
	languages: z.string().max(100).optional(),
	discord: z.string().max(50).optional(),
	pronouns: z.string().max(50).optional(),
});
