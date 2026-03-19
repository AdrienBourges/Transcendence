import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";

export function errorMiddleware(
	error: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	console.error(error);

	if (error instanceof ApiError) {
		return res.status(error.statusCode).json({
			message: error.message,
		});
	}

	if (error instanceof Error) {
		return res.status(500).json({
			message: error.message,
		});
	}

	return res.status(500).json({
		message: "Internal server error",
	});
}
