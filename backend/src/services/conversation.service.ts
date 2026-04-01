import prisma from "../prisma.js";
import { ApiError } from "../utils/ApiError.js";


export async function getOrCreateConversation(currentUserId, targetUserId) {

    if (currentUserId == targetUserId)
        throw new ApiError(400, "cannot have a conversation with yourself")

    const conversation = await prisma.conversation.findFirst({
        where: {
            AND: [
                { ConvParticipants: { some: { userId: currentUserId } } },
                { ConvParticipants: { some: { userId: targetUserId } } },
            ]
        }
    })
    if (conversation === null) {
        return await prisma.conversation.create({
            data: {
                ConvParticipants: {
                    create: [
                        { userId: currentUserId },
                        { userId: targetUserId },
                    ]
                }
            }
        })
    }

    return conversation;
}

export async function getConversations(currentUserId) {

    const result = await prisma.conversation.findMany({
        where: {
            ConvParticipants: { some: { userId: currentUserId } }
        },
        include: {
            ConvParticipants: {
                where: { userId: { not: currentUserId } },
                select: {
                    user: {
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
                    }
                }
            }
        }
    });
    return result;
}

export async function getMessages(conversationId, currentUserId) {

    const conversation = await prisma.conversation.findFirst({
        where: {
            AND: [
                { ConvParticipants: { some: { userId: currentUserId } } },
                { id: conversationId },
            ]
        }
    })

    if (conversation === null)
        throw new ApiError(400, "user is not part of that conversation")

    const messages = await prisma.message.findMany({
        where: { convId: conversationId },
        orderBy: { createdAt: 'asc' },
    });
    return messages;
}