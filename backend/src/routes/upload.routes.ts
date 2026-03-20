import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadAvatar as uploadAvatarMiddleware } from "../config/upload.js";
import { uploadAvatar } from "../controllers/upload.controller.js";

const router = Router();

router.post("/avatar", authMiddleware, uploadAvatarMiddleware.single("avatar"), uploadAvatar);

export default router;
