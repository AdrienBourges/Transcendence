import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

type RegisterInput = {
	email: string;
	username: string;
	password: string;
};

type LoginInput = {
	email: string;
	password: string;
};

export async function register(data: RegisterInput) {
	const existingUser = await prisma.user.findUnique({
		where: { email: data.email },
	});

	if (existingUser) {
		throw new ApiError(409, "Email already in use");
	}

	const existingUsername = await prisma.user.findUnique({
		where: { username: data.username },
	});

	if (existingUsername) {
		throw new ApiError(409, "Username already in use");
	}

	const hashedPassword = await bcrypt.hash(data.password, 10);

	const user = await prisma.user.create({
		data: {
			email: data.email,
			username: data.username,
			passwordHash: hashedPassword,
		},
		select: {
			id: true,
			email: true,
			username: true,
		},
	});

	return user;
}

export async function login(data: LoginInput) {
	const user = await prisma.user.findUnique({
		where: { email: data.email },
	});

	if (!user) {
		throw new ApiError(401, "Invalid credentials");
	}

	const isValid = await bcrypt.compare(data.password, user.passwordHash);

	if (!isValid) {
		throw new ApiError(401, "Invalid credentials");
	}

	const token = jwt.sign(
		{ sub: user.id },
		process.env.JWT_SECRET as string,
		{ expiresIn: "7d" }
	);

	return {
		token,
		user: {
			id: user.id,
			email: user.email,
			username: user.username,
		},
	};
}
