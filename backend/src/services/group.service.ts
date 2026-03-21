import prisma from "../prisma.js";
import { ApiError } from "../utils/ApiError.js";

type CreateGroupInput = {
	name: string;
	description?: string;
};

export async function createGroup(ownerId: number, data: CreateGroupInput) {
	return prisma.$transaction(async (tx) => {
		const group = await tx.group.create({
			data: {
				name: data.name,
				description: data.description,
				ownerId,
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

export async function getGroupById(groupId: number) {
	const group = await prisma.group.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			name: true,
			description: true,
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
		throw new ApiError(
			409,
			"A group invitation already exists for this user"
		);
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

		await tx.groupInvitation.update({
			where: { id: invitationId },
			data: {
				status: "accepted",
			},
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

	await prisma.groupInvitation.update({
		where: { id: invitationId },
		data: {
			status: "rejected",
		},
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
