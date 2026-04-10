import prisma from "../prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { Prisma, ProjectName } from "@prisma/client";

type CreateProjectRegistrationInput = {
	projectName: ProjectName;
	deadline?: string;
	isBonus?: boolean;
	description?: string;
};

type SearchProjectRegistrationsInput = {
	projectName?: ProjectName;
	isBonus?: "true" | "false";
	maxDeadline?: string;
};

export async function createProjectRegistration(
	userId: number,
	data: CreateProjectRegistrationInput
) {
	return prisma.projectRegistration.create({
		data: {
			userId,
			projectName: data.projectName,
			isBonus: data.isBonus ?? false,
			...(data.description !== undefined && {
				description: data.description,
			}),
			...(data.deadline !== undefined && {
				deadline: data.deadline === "" ? null : new Date(data.deadline),
			}),
		},
		select: {
			id: true,
			projectName: true,
			deadline: true,
			isBonus: true,
			description: true,
			createdAt: true,
			user: {
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
		},
	});
}

export async function searchProjectRegistrations(
	filters: SearchProjectRegistrationsInput
) {
	const where: Prisma.ProjectRegistrationWhereInput = {};

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

	return prisma.projectRegistration.findMany({
		where,
		select: {
			id: true,
			projectName: true,
			deadline: true,
			isBonus: true,
			description: true,
			createdAt: true,
			user: {
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
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function getMyProjectRegistrations(userId: number) {
	return prisma.projectRegistration.findMany({
		where: { userId },
		select: {
			id: true,
			projectName: true,
			deadline: true,
			isBonus: true,
			description: true,
			createdAt: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function getProjectRegistrationById(id: number) {
	const registration = await prisma.projectRegistration.findUnique({
		where: { id },
		select: {
			id: true,
			projectName: true,
			deadline: true,
			isBonus: true,
			description: true,
			createdAt: true,
			user: {
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
		},
	});

	if (!registration) {
		throw new ApiError(404, "Project registration not found");
	}

	return registration;
}

export async function deleteProjectRegistration(
	id: number,
	currentUserId: number
) {
	const registration = await prisma.projectRegistration.findUnique({
		where: { id },
		select: {
			id: true,
			userId: true,
		},
	});

	if (!registration) {
		throw new ApiError(404, "Project registration not found");
	}

	if (registration.userId !== currentUserId) {
		throw new ApiError(403, "You can only delete your own project registration");
	}

	await prisma.projectRegistration.delete({
		where: { id },
	});
}
