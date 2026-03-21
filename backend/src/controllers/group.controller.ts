import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import * as groupService from "../services/group.service.js";

export async function createGroup(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const group = await groupService.createGroup(req.user.id, req.body);

	return res.status(201).json(group);
}

export async function getGroupById(req: Request, res: Response) {
	const groupId = Number(req.params.id);

	if (Number.isNaN(groupId)) {
		throw new ApiError(400, "Invalid group id");
	}

	const group = await groupService.getGroupById(groupId);

	return res.json(group);
}
