import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import * as groupService from "../services/group.service.js";

export async function createGroup(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const group = await groupService.createGroup(req.user.id, req.body);
	return res.status(201).json(group);
}

export async function getGroupById(req: Request, res: Response) {
	const groupId = Number(req.params.id);

	if (Number.isNaN(groupId)) {
		throw new ApiError(400, "Invalid group id");
	}

	const group = await groupService.getGroupById(groupId);
	return res.json(group);
}

export async function getMyGroups(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const groups = await groupService.getMyGroups(req.user.id);
	return res.json(groups);
}

export async function updateGroup(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const groupId = Number(req.params.id);

	if (Number.isNaN(groupId)) {
		throw new ApiError(400, "Invalid group id");
	}

	const group = await groupService.updateGroup(groupId, req.user.id, req.body);
	return res.json(group);
}

export async function deleteGroup(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const groupId = Number(req.params.id);

	if (Number.isNaN(groupId)) {
		throw new ApiError(400, "Invalid group id");
	}

	await groupService.deleteGroup(groupId, req.user.id);

	return res.json({
		message: "Group deleted successfully",
	});
}

export async function getGroupMembers(req: Request, res: Response) {
	const groupId = Number(req.params.id);

	if (Number.isNaN(groupId)) {
		throw new ApiError(400, "Invalid group id");
	}

	const members = await groupService.getGroupMembers(groupId);
	return res.json(members);
}

export async function createGroupInvitation(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const groupId = Number(req.params.id);

	if (Number.isNaN(groupId)) {
		throw new ApiError(400, "Invalid group id");
	}

	const invitation = await groupService.createGroupInvitation(
		groupId,
		req.user.id,
		req.body.invitedUserId
	);

	return res.status(201).json(invitation);
}

export async function getReceivedGroupInvitations(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const invitations = await groupService.getReceivedGroupInvitations(req.user.id);
	return res.json(invitations);
}

export async function getGroupInvitations(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const groupId = Number(req.params.id);

	if (Number.isNaN(groupId)) {
		throw new ApiError(400, "Invalid group id");
	}

	const invitations = await groupService.getGroupInvitations(groupId, req.user.id);
	return res.json(invitations);
}

export async function acceptGroupInvitation(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const invitationId = Number(req.params.id);

	if (Number.isNaN(invitationId)) {
		throw new ApiError(400, "Invalid invitation id");
	}

	await groupService.acceptGroupInvitation(invitationId, req.user.id);

	return res.json({
		message: "Invitation accepted successfully",
	});
}

export async function rejectGroupInvitation(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const invitationId = Number(req.params.id);

	if (Number.isNaN(invitationId)) {
		throw new ApiError(400, "Invalid invitation id");
	}

	await groupService.rejectGroupInvitation(invitationId, req.user.id);

	return res.json({
		message: "Invitation rejected successfully",
	});
}

export async function cancelGroupInvitation(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const invitationId = Number(req.params.id);

	if (Number.isNaN(invitationId)) {
		throw new ApiError(400, "Invalid invitation id");
	}

	await groupService.cancelGroupInvitation(invitationId, req.user.id);

	return res.json({
		message: "Invitation cancelled successfully",
	});
}

export async function removeGroupMember(req: Request, res: Response) {
	if (!req.user) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const groupId = Number(req.params.groupId);
	const userId = Number(req.params.userId);

	if (Number.isNaN(groupId)) {
		throw new ApiError(400, "Invalid group id");
	}

	if (Number.isNaN(userId)) {
		throw new ApiError(400, "Invalid user id");
	}

	await groupService.removeGroupMember(groupId, req.user.id, userId);

	return res.json({
		message: "Member removed successfully",
	});
}
