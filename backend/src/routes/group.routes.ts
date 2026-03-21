import { Router } from "express";
import { createGroup, getGroupById } from "../controllers/group.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createGroupSchema } from "../schemas/group.schema.js";

const router = Router();

router.post("/", authMiddleware, validate(createGroupSchema), createGroup);
router.get("/:id", getGroupById);

export default router;
