import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import uploadRoutes from "./upload.routes.js";
import userRoutes from "./user.routes.js";
import groupRoutes from "./group.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/upload", uploadRoutes);
router.use("/groups", groupRoutes);

export default router;
