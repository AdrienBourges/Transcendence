import { Router } from "express";
import { getMe, getUserById } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.get("/:id", getUserById);

export default router;
