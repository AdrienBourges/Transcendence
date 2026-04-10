import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ProjectName } from "@prisma/client";
import * as projectRegistrationService from "../services/projectRegistration.service.js";

export async function createProjectRegistration(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const registration = await projectRegistrationService.createProjectRegistration(
		req.user.id,
		req.body
	);

	return res.status(201).json(registration);
}

export async function searchProjectRegistrations(req: Request, res: Response) {
	const { projectName, isBonus, maxDeadline } = req.query;

	const filters: {
		projectName?: ProjectName;
		isBonus?: "true" | "false";
		maxDeadline?: string;
	} = {};

	if (typeof projectName === "string") {
		filters.projectName = projectName as ProjectName;
	}

	if (typeof isBonus === "string") {
		filters.isBonus = isBonus as "true" | "false";
	}

	if (typeof maxDeadline === "string") {
		filters.maxDeadline = maxDeadline;
	}

	const registrations =
		await projectRegistrationService.searchProjectRegistrations(filters);

	return res.json(registrations);
}

export async function getMyProjectRegistrations(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const registrations =
		await projectRegistrationService.getMyProjectRegistrations(req.user.id);

	return res.json(registrations);
}

export async function getProjectRegistrationById(req: Request, res: Response) {
	const id = Number(req.params.id);

	if (Number.isNaN(id)) {
		throw new ApiError(400, "Invalid project registration id");
	}

	const registration =
		await projectRegistrationService.getProjectRegistrationById(id);

	return res.json(registration);
}

export async function deleteProjectRegistration(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const id = Number(req.params.id);

	if (Number.isNaN(id)) {
		throw new ApiError(400, "Invalid project registration id");
	}

	await projectRegistrationService.deleteProjectRegistration(id, req.user.id);

	return res.json({
		message: "Project registration deleted successfully",
	});
}
