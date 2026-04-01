import { Server } from "socket.io";
import { verifyToken } from "./utils/jwt.js";
import prisma from "./prisma.js";


const presenceMap = new Map<number, number>();

export function initSocket(io: Server) {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("Unauthorized"));
            const payload = verifyToken(token);
            const conversationId = Number(socket.handshake.query.conversationId);
            if (!conversationId) return next(new Error("Bad Request"));
            const participant = await prisma.conversationParticipant.findUnique({
                where: { convId_userId: { convId: conversationId, userId: payload.sub } },
            });
            if (!participant) return next(new Error("Forbidden"));
            socket.data.userId = payload.sub;
            socket.data.conversationId = conversationId;
            next();
        }
        catch (err) {
            next(new Error("Unauthorized"));
        }
    })
    io.on("connection", (socket) => {
        const userId: number = socket.data.userId;
        const conversationId: number = socket.data.conversationId;
        const room = `conversation:${conversationId}`;

        socket.join(room);
        const prev = presenceMap.get(userId) ?? 0;
        presenceMap.set(userId, prev + 1);
        if (prev === 0) {
            io.to(room).emit("presence:update", { userId, online: true });
        }
        socket.on("message:send", async (data: { content: string }) => {
            try {
                const content = data?.content?.trim();
                if (!content) return;

                const message = await prisma.message.create({
                    data: { convId: conversationId, senderId: userId, content },
                });

                io.to(room).emit("message:new", message);
            } catch (err) {
                console.error("Error saving message:", err);
            }
        });
        socket.on("disconnect", () => {
            const count = presenceMap.get(userId) ?? 1;
            const next = count - 1;
            if (next <= 0) {
                presenceMap.delete(userId);
                io.to(room).emit("presence:update", { userId, online: false })
            }
            else {
                presenceMap.set(userId, next);
            }
        });
    });
}