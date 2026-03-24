import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import * as friendService from "../services/friend.service.js";

export async function addFriend(req: Request, res: Response) {
	if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
		throw new ApiError(400, "Invalid user id");
	}
    await friendService.addFriend(req.user.id, userId)
    return res.status(201).json({ message: "Friend added" });
}

export async function removeFriend(req: Request, res: Response) {
	if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
		throw new ApiError(400, "Invalid user id");
	}
    await friendService.removeFriend(req.user.id, userId)
    return res.status(204).send();
}

export async function getFriends(req: Request, res: Response) {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const user = await friendService.getFriends(req.user.id);

    return res.json(user);
}
