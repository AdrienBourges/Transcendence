import prisma from "../prisma.js";
import { ApiError } from "../utils/ApiError.js";

export async function getMe(userId: number) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			username: true,
			profile: {
				select: {
					avatarUrl: true,
					languages: true,
					discord: true,
					pronouns: true,
				},
			},
		},
	});
}

export async function getUserById(userId: number) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			username: true,
			profile: {
				select: {
					avatarUrl: true,
					languages: true,
					discord: true,
					pronouns: true,
				},
			},
		},
	});

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return user;
}

export async function updateMe(
	userId: number,
	data: {
		avatarUrl?: string;
		languages?: string;
		discord?: string;
		pronouns?: string;
	}
) {
	await prisma.profile.update({
		where: { userId },
		data: {
			avatarUrl: data.avatarUrl,
			languages: data.languages,
			discord: data.discord,
			pronouns: data.pronouns,
		},
	});

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			username: true,
			profile: {
				select: {
					avatarUrl: true,
					languages: true,
					discord: true,
					pronouns: true,
				},
			},
		},
	});

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return user;
}
