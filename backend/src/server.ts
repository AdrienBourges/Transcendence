import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./prisma";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
	origin: "http://localhost:5173",
	credentials: true,
}));

app.use(express.json());

app.get("/api/health", (_req, res) => {
	res.json({
		message: "Backend is running",
	});
});

app.get("/api/db-health", async (_req, res) => {
	try {
		await prisma.$queryRaw`SELECT 1`;

		res.json({
			message: "Database connection OK",
		});
	} catch (error) {
		console.error("Database health check failed:", error);

		res.status(500).json({
			message: "Database connection failed",
		});
	}
});
app.get("/api/prisma-health", async (_req, res) => {
	try {
		const users = await prisma.user.findMany();

		res.json({
			message: "Prisma connection OK",
			userCount: users.length,
		});
	} catch (error) {
		console.error("Prisma health check failed:", error);

		res.status(500).json({
			message: "Prisma query failed",
		});
	}
});

app.post("/api/test-user", async (req, res) => {
	try {
		const { email, username, passwordHash } = req.body;

		const user = await prisma.user.create({
			data: {
				email,
				passwordHash,
				profile: {
					create: {
						username,
					},
				},
			},
			include: {
				profile: true,
			},
		});

		res.status(201).json(user);
	} catch (error) {
		console.error("Create test user failed:", error);

		res.status(500).json({
			message: "Failed to create test user",
		});
	}
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
