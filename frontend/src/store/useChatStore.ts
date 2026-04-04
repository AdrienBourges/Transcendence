import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { AUTH_TOKEN_KEY } from '@/utils/constants';

interface ChatState {
  sockets: Map<number, Socket>;
  activeConvId: number | null;
  hasNotification: boolean;
  setNotification: (value: boolean) => void;
  setActiveConv: (convId: number | null) => void;
  joinConversations: (convIds: number[]) => void; // Added batch join
  disconnectAll: () => void;
  sendMessage: (content: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sockets: new Map(),
  activeConvId: null,
  hasNotification: false,

  setNotification: (value) => set({ hasNotification: value }),
  setActiveConv: (convId) => set({ activeConvId: convId }),

  joinConversations: (convIds: number[]) => {
    const { sockets } = get();
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return;

    const newSockets = new Map(sockets);
    let changed = false;

    convIds.forEach((id) => {
      const convId = Number(id);
      if (newSockets.has(convId)) return; // Prevent duplicate connections

      changed = true;
      const socket = io("http://localhost:3000", {
        auth: { token },
        query: { conversationId: convId.toString() },
        transports: ['websocket'],
        autoConnect: false,
      });

      socket.on('message:new', (msg: any) => {
        const { activeConvId } = get();
        // Trigger notification only if the message is from a conversation not currently being viewed
        if (Number(msg.convId) !== Number(activeConvId)) {
          console.log(`🔔 [NOTIF] New message in ${msg.convId}`);
          set({ hasNotification: true });
        }
      });

      socket.on('connect_error', (err) => {
        console.error(`⚠️ [SOCKET:${convId}]`, err.message);
        // If "Bad Request", the user might have been removed from the conversation; perform auto-cleanup
        if (err.message === 'Bad Request') {
          const s = get().sockets.get(convId);
          s?.disconnect();
        }
      });

      socket.connect();
      newSockets.set(convId, socket);
    });

    if (changed) set({ sockets: newSockets });
  },

  disconnectAll: () => {
    get().sockets.forEach(s => {
      s.removeAllListeners();
      s.disconnect();
    });
    set({ sockets: new Map(), activeConvId: null });
  },

  sendMessage: (content: string) => {
    const { sockets, activeConvId } = get();
    if (activeConvId === null) return;
    const socket = sockets.get(Number(activeConvId));
    if (socket?.connected) {
      socket.emit("message:send", { content });
    }
  },
}));