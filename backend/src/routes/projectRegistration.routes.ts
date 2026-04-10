import { Router } from "express";
import {
	createProjectRegistration,
	searchProjectRegistrations,
	getMyProjectRegistrations,
	getProjectRegistrationById,
	deleteProjectRegistration,
} from "../controllers/projectRegistration.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
	createProjectRegistrationSchema,
	searchProjectRegistrationsSchema,
} from "../schemas/projectRegistration.schema.js";

const router = Router();

router.get(
	"/search",
	validate(searchProjectRegistrationsSchema, "query"),
	searchProjectRegistrations
);

router.post(
	"/",
	authMiddleware,
	validate(createProjectRegistrationSchema),
	createProjectRegistration
);

router.get("/me", authMiddleware, getMyProjectRegistrations);
router.get("/:id", getProjectRegistrationById);
router.delete("/:id", authMiddleware, deleteProjectRegistration);

export default router;
