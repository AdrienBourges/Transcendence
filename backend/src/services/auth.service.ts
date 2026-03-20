import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
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
			profile: {
				create: {},
			},
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
export async function oauth42Callback(code: string) {
	const tokenResponse = await axios.post(
		"https://api.intra.42.fr/oauth/token",
		{
			grant_type: "authorization_code",
			client_id: process.env.OAUTH42_UID,
			client_secret: process.env.OAUTH42_SECRET,
			code: code,
			redirect_uri: process.env.OAUTH42_REDIRECT_URI,
		}
	);

	if (!tokenResponse.data.access_token) {
		throw new ApiError(401, "Failed to get 42 access token");
	}

	const accessToken = tokenResponse.data.access_token;

	const userInfoResponse = await axios.get("https://api.intra.42.fr/v2/me", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const oauth42User = userInfoResponse.data;

	if (!oauth42User.id || !oauth42User.email) {
		throw new ApiError(401, "Failed to get 42 user info");
	}

	let user = await prisma.user.findUnique({
		where: { oauth42Id: String(oauth42User.id) },
	});

	if (!user) {
		let username = oauth42User.login;

		const existingUsername = await prisma.user.findUnique({
			where: { username: username },
		});

		if (existingUsername) {
			username = `${oauth42User.login}_${oauth42User.id}`;
		}

		user = await prisma.user.create({
			data: {
				email: oauth42User.email,
				username: username,
				oauth42Id: String(oauth42User.id),
			},
		});
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