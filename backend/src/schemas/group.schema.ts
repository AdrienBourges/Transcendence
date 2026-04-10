import { z } from "zod";
import { ProjectName } from "@prisma/client";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createGroupSchema = z.object({
	name: z.string().min(3).max(50),
	description: z.string().max(500).optional(),
	projectName: z.nativeEnum(ProjectName),
	deadline: z
		.string()
		.regex(dateRegex, "Deadline must be in YYYY-MM-DD format")
		.optional()
		.or(z.literal("")),
	isBonus: z.boolean().optional(),
}).strict();

export const updateGroupSchema = z.object({
	name: z.string().min(3).max(50).optional(),
	description: z.string().max(500).nullable().optional(),
	projectName: z.nativeEnum(ProjectName).optional(),
	deadline: z
		.string()
		.regex(dateRegex, "Deadline must be in YYYY-MM-DD format")
		.nullable()
		.optional()
		.or(z.literal("")),
	isBonus: z.boolean().optional(),
}).strict().refine(
	(data) => Object.keys(data).length > 0,
	{ message: "At least one field must be provided" }
);

export const createGroupInvitationSchema = z.object({
	invitedUserId: z.number().int().positive(),
}).strict();

export const searchGroupsSchema = z.object({
	projectName: z.nativeEnum(ProjectName).optional(),
	isBonus: z.enum(["true", "false"]).optional(),
	maxDeadline: z
		.string()
		.regex(dateRegex, "maxDeadline must be in YYYY-MM-DD format")
		.optional(),
}).strict();
