import { Router } from "express";
import { getMe, getUserById, updateMe } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateMeSchema } from "../schemas/user.schema.js";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, validate(updateMeSchema), updateMe);
router.get("/:id", getUserById);

export default router;
