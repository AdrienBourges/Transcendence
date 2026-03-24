import { Router } from "express";
import { addFriend, removeFriend } from "../controllers/friend.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/:id", authMiddleware, addFriend);
router.delete("/:id", authMiddleware, removeFriend);

export default router;
