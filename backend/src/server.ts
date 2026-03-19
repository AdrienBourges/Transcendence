import app from "./app.js";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});

// app.get("/api/health", (_req, res) => {
// 	res.json({
// 		message: "Backend is running",
// 	});
// });
//
// app.get("/api/db-health", async (_req, res) => {
// 	try {
// 		await prisma.$queryRaw`SELECT 1`;
//
// 		res.json({
// 			message: "Database connection OK",
// 		});
// 	} catch (error) {
// 		console.error("Database health check failed:", error);
//
// 		res.status(500).json({
// 			message: "Database connection failed",
// 		});
// 	}
// });
// app.get("/api/prisma-health", async (_req, res) => {
// 	try {
// 		const users = await prisma.user.findMany();
//
// 		res.json({
// 			message: "Prisma connection OK",
// 			userCount: users.length,
// 		});
// 	} catch (error) {
// 		console.error("Prisma health check failed:", error);
//
// 		res.status(500).json({
// 			message: "Prisma query failed",
// 		});
// 	}
// });
//
// app.post("/api/test-user", async (req, res) => {
// 	try {
// 		const { email, username, passwordHash } = req.body;
//
// 		const user = await prisma.user.create({
// 			data: {
// 				email,
// 				passwordHash,
// 				profile: {
// 					create: {
// 						username,
// 					},
// 				},
// 			},
// 			include: {
// 				profile: true,
// 			},
// 		});
//
// 		res.status(201).json(user);
// 	} catch (error) {
// 		console.error("Create test user failed:", error);
//
// 		res.status(500).json({
// 			message: "Failed to create test user",
// 		});
// 	}
// });
