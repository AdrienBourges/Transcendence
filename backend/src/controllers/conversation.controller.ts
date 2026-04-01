import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import * as conversationService from "../services/conversation.service.js";

export async function getOrCreateConversation(req: Request, res: Response) {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
        throw new ApiError(400, "Invalid user id");
    }
    const conv = await conversationService.getOrCreateConversation(req.user.id, userId)
    return res.status(201).json(conv);
}

export async function getConversations(req: Request, res: Response) {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const conv =await conversationService.getConversations(req.user.id)
    return res.json(conv);
}

export async function getMessages(req: Request, res: Response) {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const messages = await conversationService.getMessages(Number(req.params.id), req.user.id);
    return res.json(messages);
}
