import express from "express";
import cors from "cors";
import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db";

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
		const result = await pool.query(
			"SELECT NOW() AS now, current_database() AS database"
		);

		res.json({
			message: "Database connection OK",
			database: result.rows[0].database,
			now: result.rows[0].now,
		});
	} catch (error) {
		console.error("Database health check failed:", error);

		res.status(500).json({
			message: "Database connection failed",
		});
	}
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
