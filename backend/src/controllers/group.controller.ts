import type { Request, Response } from "express";
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
