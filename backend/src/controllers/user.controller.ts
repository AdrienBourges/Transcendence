import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import * as userService from "../services/user.service.js";

export async function getMe(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const user = await userService.getMe(req.user.id);

	return res.json(user);
}

export async function getUserById(req: Request, res: Response) {
	const userId = Number(req.params.id);

	if (Number.isNaN(userId)) {
		throw new ApiError(400, "Invalid user id");
	}

	const user = await userService.getUserById(userId);

	return res.json(user);
}

export async function updateMe(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const user = await userService.updateMe(req.user.id, req.body);

	return res.json(user);
}

export async function searchUsers(req: Request, res: Response) {
	const { username } = req.query;

	if (typeof username !== "string") {
		throw new ApiError(400, "Invalid username query");
	}

	const users = await userService.searchUsersByUsername(username);
	return res.json(users);
}
