import { Router } from "express";
import { createGroup, createGroupInvitation, getGroupById, getMyGroups, getReceivedGroupInvitations, acceptGroupInvitation, rejectGroupInvitation, removeGroupMember, cancelGroupInvitation, getGroupInvitations, getGroupMembers, updateGroup, deleteGroup } from "../controllers/group.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createGroupInvitationSchema, createGroupSchema, updateGroupSchema } from "../schemas/group.schema.js";

const router = Router();

router.post("/", authMiddleware, validate(createGroupSchema), createGroup);
router.get("/me", authMiddleware, getMyGroups);

router.get("/invitations/received", authMiddleware, getReceivedGroupInvitations);
router.post("/invitations/:id/accept", authMiddleware, acceptGroupInvitation);
router.post("/invitations/:id/reject", authMiddleware, rejectGroupInvitation);
router.delete("/invitations/:id", authMiddleware, cancelGroupInvitation);

router.get("/:id/members", getGroupMembers);
router.get("/:id/invitations", authMiddleware, getGroupInvitations);
router.post("/:id/invitations", authMiddleware, validate(createGroupInvitationSchema), createGroupInvitation);

router.patch("/:id", authMiddleware, validate(updateGroupSchema), updateGroup);
router.delete("/:id", authMiddleware, deleteGroup);
router.delete("/:groupId/members/:userId", authMiddleware, removeGroupMember);
router.get("/:id", getGroupById);

export default router;
