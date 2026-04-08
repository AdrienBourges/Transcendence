import { z } from "zod";

export const createGroupSchema = z.object({
	name: z.string().min(3).max(50),
	description: z.string().max(500).optional(),
	projectName: z.string().min(2).max(100),
	deadline: z.string().datetime().optional(),
	isBonus: z.boolean().optional(),
}).strict();

export const updateGroupSchema = z.object({
	name: z.string().min(3).max(50).optional(),
	description: z.string().max(500).nullable().optional(),
	projectName: z.string().min(2).max(100).optional(),
	deadline: z.string().datetime().nullable().optional(),
	isBonus: z.boolean().optional(),
}).strict().refine(
	(data) => Object.keys(data).length > 0,
	{ message: "At least one field must be provided" }
);

export const createGroupInvitationSchema = z.object({
	invitedUserId: z.number().int().positive(),
}).strict();
