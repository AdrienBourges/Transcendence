import { Router } from "express";
import { createGroup, createGroupInvitation, getGroupById, getMyGroups, getReceivedGroupInvitations, acceptGroupInvitation, rejectGroupInvitation, removeGroupMember } from "../controllers/group.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createGroupInvitationSchema, createGroupSchema } from "../schemas/group.schema.js";

const router = Router();

router.post("/", authMiddleware, validate(createGroupSchema), createGroup);
router.get("/me", authMiddleware, getMyGroups);

router.get("/invitations/received", authMiddleware, getReceivedGroupInvitations);
router.post("/invitations/:id/accept", authMiddleware, acceptGroupInvitation);
router.post("/invitations/:id/reject", authMiddleware, rejectGroupInvitation);

router.delete("/:groupId/members/:userId", authMiddleware, removeGroupMember);

router.get("/:id", getGroupById);
router.post("/:id/invitations", authMiddleware, validate(createGroupInvitationSchema), createGroupInvitation);

export default router;
