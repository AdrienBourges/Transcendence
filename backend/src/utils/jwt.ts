import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

type JwtPayload = {
	sub: number;
};

export function signToken(userId: number) {
	return jwt.sign(
		{ sub: userId },
		JWT_SECRET,
		{ expiresIn: "7d" }
	);
}

export function verifyToken(token: string) {
	return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
