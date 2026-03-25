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
		throw new ApiError(409, "User already has a pending invitation for this group");
	}

	if (invitedUserId === currentUserId) {
		throw new ApiError(400, "You cannot invite yourself");
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

export async function acceptGroupInvitation(
	invitationId: number,
	currentUserId: number
) {
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
