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
