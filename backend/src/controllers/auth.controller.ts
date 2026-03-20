import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
	const result = await authService.register(req.body);
	res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
	const result = await authService.login(req.body);
	res.json(result);
}
export async function oauth42Callback(req: Request, res: Response) {
	const { code } = req.query;

	if (!code || typeof code !== "string") {
		res.status(400).json({ error: "Missing authorization code" });
		return;
	}

	try {
		const result = await authService.oauth42Callback(code);
		res.json(result);
	} catch (error: unknown) {
		console.error("OAuth42 callback error:", error);
		const message =
			error instanceof Error ? error.message : "OAuth42 authentication failed";
		res.status(500).json({ error: message });
	}
}