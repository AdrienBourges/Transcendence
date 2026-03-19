import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

export function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const token = authHeader.split(" ")[1];
	if (!token) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	try {
		const payload = verifyToken(token);
		req.user = { id: payload.sub };
		next();
	} catch {
		return res.status(401).json({
			message: "Invalid token",
		});
	}
}
