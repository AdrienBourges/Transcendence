import prisma from "../prisma.js";

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
