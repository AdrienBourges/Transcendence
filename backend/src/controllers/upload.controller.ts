import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";

export function uploadAvatar(req: Request, res: Response) {
	if (!req.file) {
		throw new ApiError(400, "No file uploaded");
	}

	return res.status(201).json({
		avatarUrl: `http://localhost:3000/uploads/avatars/${req.file.filename}`,
	});
}
