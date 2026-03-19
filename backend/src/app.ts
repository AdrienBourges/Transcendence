import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
// import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({
	origin: "http://localhost:5173",
	credentials: true,
}));

app.use(express.json());

app.use("/api", routes);

// app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
