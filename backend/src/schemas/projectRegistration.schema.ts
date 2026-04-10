import { z } from "zod";
import { ProjectName } from "@prisma/client";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createProjectRegistrationSchema = z.object({
	projectName: z.nativeEnum(ProjectName),
	deadline: z
		.string()
		.regex(dateRegex, "Deadline must be in YYYY-MM-DD format")
		.optional()
		.or(z.literal("")),
	isBonus: z.boolean().optional(),
	description: z.string().max(1000).optional(),
}).strict();

export const searchProjectRegistrationsSchema = z.object({
	projectName: z.nativeEnum(ProjectName).optional(),
	isBonus: z.enum(["true", "false"]).optional(),
	maxDeadline: z
		.string()
		.regex(dateRegex, "maxDeadline must be in YYYY-MM-DD format")
		.optional(),
}).strict();
