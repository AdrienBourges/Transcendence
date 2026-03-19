import prisma from "../prisma.js";
import { ApiError } from "../utils/ApiError.js";

export async function getMe(userId: number) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			username: true,
		},
	});
}

export async function getUserById(userId: number) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			username: true,
		},
	});

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return user;
}
