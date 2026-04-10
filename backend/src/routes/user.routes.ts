import { Router } from "express";
import { getMe, getUserById, updateMe, searchUsers } from "../controllers/user.controller.js";import { getFriends } from "../controllers/friend.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateMeSchema, searchUsersSchema } from "../schemas/user.schema.js";

const router = Router();

router.get("/search", validate(searchUsersSchema, "query"), searchUsers);
router.get("/me", authMiddleware, getMe);
router.get("/me/friends", authMiddleware, getFriends);
router.patch("/me", authMiddleware, validate(updateMeSchema), updateMe);
router.get("/:id", getUserById);

export default router;
