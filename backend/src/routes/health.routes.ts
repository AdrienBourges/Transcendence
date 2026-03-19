import { Router } from "express";
import { dbHealth, health } from "../controllers/health.controller.js";

const router = Router();

router.get("/", health);
router.get("/db", dbHealth);

export default router;
