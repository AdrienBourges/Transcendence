import { Router } from "express";
import { getOrCreateConversation, getConversations, getMessages  } from "../controllers/conversation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/private/:id", authMiddleware, getOrCreateConversation);
router.get("/:id/messages", authMiddleware, getMessages);
router.get("/", authMiddleware, getConversations);

export default router;
