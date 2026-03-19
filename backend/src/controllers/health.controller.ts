import type { Request, Response } from "express";
import prisma from "../prisma.js";

export async function health(_req: Request, res: Response) {
	res.json({ message: "Backend is running" });
}

export async function dbHealth(_req: Request, res: Response) {
	await prisma.$queryRaw`SELECT 1`;
	res.json({ message: "Database connection OK" });
}
