import { Pool } from "pg";

const pool = new Pool({
	host: process.env.POSTGRES_HOST,
	port: Number(process.env.POSTGRES_PORT),
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
});

pool.on("error", (err) => {
	console.error("Unexpected database error:", err);
});

export default pool;
