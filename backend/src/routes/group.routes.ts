import { Router } from "express";
import { createGroup } from "../controllers/group.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createGroupSchema } from "../schemas/group.schema.js";

const router = Router();

router.post("/", authMiddleware, validate(createGroupSchema), createGroup);

export default router;
