import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import prisma from "../prisma.js"; // 1. Import your Prisma instance

export async function uploadAvatar(req: Request, res: Response) { // 2. Change to async function
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    // 3. Get the current user ID (prerequisite: your route uses authMiddleware)
    const userId = (req as any).user?.id;
    if (!userId) {
        throw new ApiError(401, "User identity missing");
    }

    // 4. Construct the relative path to store in the database
    const filePath = `/uploads/avatars/${req.file.filename}`;

    try {
        // 5. Core: update the Profile in the database
        await prisma.user.update({
            where: { id: userId },
            data: {
                profile: {
                    upsert: {
                        create: { avatarUrl: filePath },
                        update: { avatarUrl: filePath }
                    }
                }
            }
        });

        // 6. Return success response
        return res.status(201).json({
            message: "Avatar updated and saved to database",
            avatarUrl: filePath,
        });

    } catch (error) {
        console.error("Database Update Error:", error);
        throw new ApiError(500, "Failed to link avatar to user profile");
    }
}

// import type { Request, Response } from "express";
// import { ApiError } from "../utils/ApiError.js";

// export function uploadAvatar(req: Request, res: Response) {
// 	if (!req.file) {
// 		throw new ApiError(400, "No file uploaded");
// 	}

// 	return res.status(201).json({
// 		avatarUrl: `http://localhost:3000/uploads/avatars/${req.file.filename}`,
// 	});
// }
