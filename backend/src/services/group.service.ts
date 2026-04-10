import prisma from "../prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { Prisma, ProjectName } from "@prisma/client";

type CreateGroupInput = {
	name: string;
	description?: string;
	projectName: ProjectName;
	deadline?: string;
	isBonus?: boolean;
};

type UpdateGroupInput = {
	name?: string;
	description?: string | null;
	projectName?: ProjectName;
	deadline?: string | null;
	isBonus?: boolean;
};

type SearchGroupsInput = {
	projectName?: ProjectName;
	isBonus?: "true" | "false";
	maxDeadline?: string;
};

function parseDeadline(value?: string | null): Date | null | undefined {
	if (value === undefined) return undefined;
	if (value === null || value === "") return null;
	return new Date(value);
}

export async function createGroup(ownerId: number, data: CreateGroupInput) {
	return prisma.$transaction(async (tx) => {
		const group = await tx.group.create({
			data: {
				name: data.name,
				projectName: data.projectName,
				isBonus: data.isBonus ?? false,
				ownerId,
				...(data.description !== undefined && {
					description: data.description,
				}),
				...(data.deadline !== undefined && {
					deadline: data.deadline === "" ? null : new Date(data.deadline),
				}),
			},
		});

		await tx.groupMember.create({
			data: {
				userId: ownerId,
				groupId: group.id,
				role: "owner",
			},
		});

		return group;
	});
}

export async function searchGroups(filters: SearchGroupsInput) {
	const where: Prisma.GroupWhereInput = {};

	if (filters.projectName !== undefined) {
		where.projectName = filters.projectName;
	}

	if (filters.isBonus === "true") {
		where.isBonus = true;
	} else if (filters.isBonus === "false") {
		where.isBonus = false;
	}

	if (filters.maxDeadline !== undefined) {
		where.deadline = {
			lte: new Date(filters.maxDeadline),
		};
	}

	return prisma.group.findMany({
		where,
		select: {
			id: true,
			name: true,
			description: true,
			projectName: true,
			deadline: true,
			isBonus: true,
			createdAt: true,
			owner: {
				select: {
					id: true,
					username: true,
					profile: {
						select: {
							avatarUrl: true,
						},
					},
				},
			},
			members: {
				select: {
					id: true,
					userId: true,
					role: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function getGroupById(groupId: number) {
	const group = await prisma.group.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			name: true,
			description: true,
			projectName: true,
			deadline: true,
			isBonus: true,
			createdAt: true,
			owner: {
				select: {
					id: true,
					username: true,
				},
			},
			members: {
				select: {
					role: true,
					joinedAt: true,
					user: {
						select: {
							id: true,
							username: true,
						},
					},
				},
				orderBy: {
					joinedAt: "asc",
				},
			},
		},
	});

	if (!group) {
		throw new ApiError(404, "Group not found");
	}

	return group;
}

export async function getMyGroups(userId: number) {
	return prisma.groupMember.findMany({
		where: { userId },
		select: {
			role: true,
			joinedAt: true,
			group: {
				select: {
					id: true,
					name: true,
					description: true,
					projectName: true,
					deadline: true,
					isBonus: true,
					createdAt: true,
					owner: {
						select: {
							id: true,
							username: true,
						},
					},
				},
			},
		},
		orderBy: {
			joinedAt: "desc",
		},
	});
}

export async function updateGroup(groupId: number, currentUserId: number, data: UpdateGroupInput) {
	const group = await prisma.group.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			ownerId: true,
		},
	});

	if (!group) {
		throw new ApiError(404, "Group not found");
	}

	if (group.ownerId !== currentUserId) {
		throw new ApiError(403, "Only the group owner can update this group");
	}

	const updateData: Prisma.GroupUpdateInput = {};

	if (data.name !== undefined) {
		updateData.name = data.name;
	}

	if (data.description !== undefined) {
		updateData.description = data.description;
	}

	if (data.projectName !== undefined) {
		updateData.projectName = data.projectName;
	}

	if (data.deadline !== undefined) {
		updateData.deadline =
			data.deadline === "" || data.deadline === null
				? null
				: new Date(data.deadline);
	}

	if (data.isBonus !== undefined) {
		updateData.isBonus = data.isBonus;
	}

	return prisma.group.update({
		where: { id: groupId },
		data: updateData,
		select: {
			id: true,
			name: true,
			description: true,
			projectName: true,
			deadline: true,
			isBonus: true,
			createdAt: true,
			owner: {
				select: {
					id: true,
					username: true,
				},
			},
		},
	});
}

export async function deleteGroup(groupId: number, currentUserId: number) {
	const group = await prisma.group.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			ownerId: true,
		},
	});

	if (!group) {
		throw new ApiError(404, "Group not found");
	}

	if (group.ownerId !== currentUserId) {
		throw new ApiError(403, "Only the group owner can delete this group");
	}

	await prisma.group.delete({
		where: { id: groupId },
	});
}

export async function getGroupMembers(groupId: number) {
	const group = await prisma.group.findUnique({
		where: { id: groupId },
		select: { id: true },
	});

	if (!group) {
		throw new ApiError(404, "Group not found");
	}

	return prisma.groupMember.findMany({
		where: { groupId },
		select: {
			id: true,
			role: true,
			joinedAt: true,
			user: {
				select: {
					id: true,
					username: true,
				},
			},
		},
		orderBy: [
			{ joinedAt: "asc" },
		],
	});
}

export async function createGroupInvitation(groupId: number, currentUserId: number, invitedUserId: number) {
	const group = await prisma.group.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			ownerId: true,
		},
	});

	if (!group) {
		throw new ApiError(404, "Group not found");
	}

	if (group.ownerId !== currentUserId) {
		throw new ApiError(403, "Only the group owner can invite members");
	}

	if (invitedUserId === currentUserId) {
		throw new ApiError(400, "You cannot invite yourself");
	}

	const invitedUser = await prisma.user.findUnique({
		where: { id: invitedUserId },
		select: { id: true },
	});

	if (!invitedUser) {
		throw new ApiError(404, "User not found");
	}

	const existingMembership = await prisma.groupMember.findUnique({
		where: {
			userId_groupId: {
				userId: invitedUserId,
				groupId,
			},
		},
	});

	if (existingMembership) {
		throw new ApiError(409, "User is already a member of this group");
	}

	const existingInvitation = await prisma.groupInvitation.findUnique({
		where: {
			groupId_invitedUserId: {
				groupId,
				invitedUserId,
			},
		},
	});

	if (existingInvitation) {
		throw new ApiError(409, "A group invitation already exists for this user");
	}

	return prisma.groupInvitation.create({
		data: {
			groupId,
			invitedById: currentUserId,
			invitedUserId,
			status: "pending",
		},
	});
}

export async function getReceivedGroupInvitations(currentUserId: number) {
	return prisma.groupInvitation.findMany({
		where: {
			invitedUserId: currentUserId,
			status: "pending",
		},
		select: {
			id: true,
			status: true,
			createdAt: true,
			group: {
				select: {
					id: true,
					name: true,
					description: true,
					projectName: true,
					deadline: true,
					isBonus: true,
					createdAt: true,
					owner: {
						select: {
							id: true,
							username: true,
						},
					},
				},
			},
			invitedBy: {
				select: {
					id: true,
					username: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function getGroupInvitations(groupId: number, currentUserId: number) {
	const group = await prisma.group.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			ownerId: true,
		},
	});

	if (!group) {
		throw new ApiError(404, "Group not found");
	}

	if (group.ownerId !== currentUserId) {
		throw new ApiError(403, "Only the group owner can view group invitations");
	}

	return prisma.groupInvitation.findMany({
		where: { groupId },
		select: {
			id: true,
			status: true,
			createdAt: true,
			invitedUser: {
				select: {
					id: true,
					username: true,
				},
			},
			invitedBy: {
				select: {
					id: true,
					username: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function acceptGroupInvitation(invitationId: number, currentUserId: number) {
	const invitation = await prisma.groupInvitation.findUnique({
		where: { id: invitationId },
		select: {
			id: true,
			groupId: true,
			invitedUserId: true,
			status: true,
		},
	});

	if (!invitation) {
		throw new ApiError(404, "Invitation not found");
	}

	if (invitation.invitedUserId !== currentUserId) {
		throw new ApiError(403, "You cannot accept this invitation");
	}

	if (invitation.status !== "pending") {
		throw new ApiError(409, "This invitation is no longer pending");
	}

	const existingMembership = await prisma.groupMember.findUnique({
		where: {
			userId_groupId: {
				userId: currentUserId,
				groupId: invitation.groupId,
			},
		},
	});

	if (existingMembership) {
		throw new ApiError(409, "You are already a member of this group");
	}

	await prisma.$transaction(async (tx) => {
		await tx.groupMember.create({
			data: {
				userId: currentUserId,
				groupId: invitation.groupId,
				role: "member",
			},
		});

		await tx.groupInvitation.delete({
			where: { id: invitationId },
		});
	});
}

export async function rejectGroupInvitation(invitationId: number, currentUserId: number) {
	const invitation = await prisma.groupInvitation.findUnique({
		where: { id: invitationId },
		select: {
			id: true,
			invitedUserId: true,
			status: true,
		},
	});

	if (!invitation) {
		throw new ApiError(404, "Invitation not found");
	}

	if (invitation.invitedUserId !== currentUserId) {
		throw new ApiError(403, "You cannot reject this invitation");
	}

	if (invitation.status !== "pending") {
		throw new ApiError(409, "This invitation is no longer pending");
	}

	await prisma.groupInvitation.delete({
		where: { id: invitationId },
	});
}

export async function cancelGroupInvitation(invitationId: number, currentUserId: number) {
	const invitation = await prisma.groupInvitation.findUnique({
		where: { id: invitationId },
		select: {
			id: true,
			status: true,
			invitedById: true,
			group: {
				select: {
					id: true,
					ownerId: true,
				},
			},
		},
	});

	if (!invitation) {
		throw new ApiError(404, "Invitation not found");
	}

	if (invitation.status !== "pending") {
		throw new ApiError(409, "Only pending invitations can be cancelled");
	}

	const isOwner = invitation.group.ownerId === currentUserId;
	const isSender = invitation.invitedById === currentUserId;

	if (!isOwner && !isSender) {
		throw new ApiError(403, "You cannot cancel this invitation");
	}

	await prisma.groupInvitation.delete({
		where: { id: invitationId },
	});
}

export async function removeGroupMember(groupId: number, currentUserId: number, targetUserId: number) {
	const group = await prisma.group.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			ownerId: true,
		},
	});

	if (!group) {
		throw new ApiError(404, "Group not found");
	}

	const currentMembership = await prisma.groupMember.findUnique({
		where: {
			userId_groupId: {
				userId: currentUserId,
				groupId,
			},
		},
		select: {
			role: true,
		},
	});

	if (!currentMembership) {
		throw new ApiError(403, "You are not a member of this group");
	}

	const targetMembership = await prisma.groupMember.findUnique({
		where: {
			userId_groupId: {
				userId: targetUserId,
				groupId,
			},
		},
		select: {
			role: true,
		},
	});

	if (!targetMembership) {
		throw new ApiError(404, "Target user is not a member of this group");
	}

	const isSelfRemoval = currentUserId === targetUserId;

	if (targetUserId === group.ownerId || targetMembership.role === "owner") {
		throw new ApiError(403, "The group owner cannot be removed");
	}

	if (isSelfRemoval) {
		await prisma.groupMember.delete({
			where: {
				userId_groupId: {
					userId: targetUserId,
					groupId,
				},
			},
		});

		return;
	}

	if (currentUserId !== group.ownerId) {
		throw new ApiError(403, "Only the group owner can remove other members");
	}

	await prisma.groupMember.delete({
		where: {
			userId_groupId: {
				userId: targetUserId,
				groupId,
			},
		},
	});
}
