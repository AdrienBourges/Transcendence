import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { AUTH_TOKEN_KEY } from '@/utils/constants';

interface ChatState {
  socket: Socket | null;
  isConnected: boolean;
  connect: (conversationId: number) => void;
  disconnect: () => void;
  sendMessage: (content: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (conversationId: number) => {
    const currentSocket = get().socket;
    
    // If already connected to the same conversation, return directly
    if (currentSocket?.connected && Number(currentSocket.io.opts.query?.conversationId) === conversationId) {
      return;
    }

    // If there is an old connection, clean it up first
    if (currentSocket) {
      currentSocket.disconnect();
    }

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      console.error("--- [AUTH_TOKEN_MISSING] ---");
      return;
    }

    // Initialize connection
    const socket = io("http://localhost:3000", {
      auth: { token },
      query: { conversationId: conversationId.toString() }, 
      transports: ['websocket'],
      // Remove autoConnect: false, or manually call .connect() below
      autoConnect: true, 
      reconnection: true, // Recommended to enable reconnection for better stability
    });

    socket.on('connect', () => {
      console.log(`✅ --- [SYSTEM_LINK_START] --- CONV_ID: ${conversationId}`);
      set({ isConnected: true });
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ --- [SYSTEM_LINK_TERMINATED] --- REASON:', reason);
      set({ isConnected: false });
    });

    socket.on('connect_error', (err) => {
      console.error("⚠️ --- [SOCKET_AUTH_FAILED] ---", err.message);
      set({ isConnected: false });
    });

    // Explicitly start the connection
    socket.connect();
    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, isConnected: false });
  },

  sendMessage: (content: string) => {
    const { socket, isConnected } = get();
    // Debug log: check status when sending
    console.log("📤 Attempting to send:", content, "Status:", isConnected);
    
    if (socket && isConnected) {
      socket.emit("message:send", { content });
    } else {
      console.warn("🛑 --- [SEND_FAILED] --- Socket not connected");
    }
  }
}));