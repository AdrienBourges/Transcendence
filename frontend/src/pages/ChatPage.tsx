import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';

interface ChatPageProps {
  conversationId?: string; // Used for Modal mode
  onClose?: () => void;    // Used for Modal mode
}

const ChatPage: React.FC<ChatPageProps> = ({ conversationId: propsId, onClose }) => {
  const { id: urlId } = useParams<{ id: string }>();
  const activeId = propsId || urlId;

  const { user: me } = useAuthStore();
  
  // Core Change: Destructure sockets Map 
  const { sockets, sendMessage, setActiveConv } = useChatStore();

  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const BACKEND_URL = 'http://localhost:3000';

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  /**
   * 1. Initialize Chat: Fetch history
   * Note: Connections were already established by joinConversations in HomePage
   */
  useEffect(() => {
    if (!activeId || !me?.id) return;

    const initChat = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        
        // Inform the Store of the current active conversation ID so sendMessage knows which socket to use
        setActiveConv(Number(activeId));

        const res = await axios.get(`${BACKEND_URL}/api/conversations/${activeId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const formattedMsgs = res.data.map((msg: any) => ({
          senderId: msg.senderId, // Retain ID for logic checks
          sender: msg.senderId === me.id ? 'me' : 'them',
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        
        setChatHistory(formattedMsgs);
      } catch (err) {
        console.error("CHAT_LOAD_ERROR", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    // Clear active conversation flag on unmount (sockets remain open for notification badges)
    return () => {
      setActiveConv(null);
    };
  }, [activeId, me?.id, setActiveConv]);

  /**
   * 2. Real-time Message Listening
   * Key Change: Retrieve the specific socket instance for this conversation from the sockets Map
   */
  useEffect(() => {
    const convIdNum = Number(activeId);
    const currentSocket = sockets.get(convIdNum);

    if (!currentSocket) {
      console.warn(`[CHAT] No socket instance found for convId: ${convIdNum}`);
      return;
    }

    const handleNewMessage = (msg: any) => {
      // While it's a specific socket, double-checking msg.convId is good practice
      if (Number(msg.convId) === convIdNum) {
        setChatHistory(prev => [...prev, {
          sender: msg.senderId === me?.id ? 'me' : 'them',
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    };

    currentSocket.on('message:new', handleNewMessage);
    
    return () => {
      currentSocket.off('message:new', handleNewMessage);
    };
  }, [sockets, activeId, me?.id]);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    sendMessage(messageInput); 
    setMessageInput('');
  };

  if (loading) return <div style={{ color: '#A2D2FF', padding: '20px', fontFamily: 'JetBrains Mono' }}>[SYNCING_SECURE_CHANNEL...]</div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span className="chat-label">TERMINAL_ID: {activeId}</span>
        {onClose && (
          <button onClick={onClose} className="chat-close-btn">[TERMINATE_CONNECTION]</button>
        )}
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {chatHistory.length > 0 ? chatHistory.map((msg, i) => (
          <div key={i} className={`msg-bubble ${msg.sender}`}>
            <div className="msg-text">{msg.text}</div>
            <div className="msg-time">{msg.time}</div>
          </div>
        )) : (
          <div className="no-msgs">&gt; NO_LOG_DATA_FOUND</div>
        )}
      </div>

      <div className="chat-input-area">
        <input 
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="INPUT_COMMAND..."
        />
        <button onClick={handleSend}>SEND</button>
      </div>

      <style>{`
        .chat-container { height: 100%; display: flex; flex-direction: column; background: #0a0a0a; border-radius: 4px; overflow: hidden; }
        .chat-header { padding: 15px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; background: #0f0f0f; }
        .chat-label { font-family: 'JetBrains Mono'; font-size: 0.7rem; color: #A2D2FF; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; scrollbar-width: thin; scrollbar-color: #333 #000; }
        .msg-bubble { max-width: 85%; padding: 10px 14px; border-radius: 4px; font-size: 0.85rem; line-height: 1.4; position: relative; }
        .msg-bubble.me { align-self: flex-end; background: #161616; border: 1px solid #A2D2FF; color: #A2D2FF; }
        .msg-bubble.them { align-self: flex-start; background: #111; border: 1px solid #333; color: #eee; }
        .msg-time { font-size: 0.55rem; opacity: 0.4; margin-top: 5px; text-align: right; font-family: 'JetBrains Mono'; }
        .chat-input-area { padding: 15px; border-top: 1px solid #222; display: flex; gap: 10px; background: #0a0a0a; }
        .chat-input-area input { flex: 1; background: #000; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 2px; font-family: 'JetBrains Mono'; font-size: 0.8rem; outline: none; }
        .chat-input-area input:focus { border-color: #A2D2FF; }
        .chat-input-area button { background: #A2D2FF; border: none; padding: 0 20px; border-radius: 2px; cursor: pointer; font-weight: bold; font-family: 'JetBrains Mono'; transition: 0.2s; }
        .chat-input-area button:hover { opacity: 0.8; }
        .chat-close-btn { background: none; border: none; color: #444; cursor: pointer; font-size: 0.65rem; font-family: 'JetBrains Mono'; }
        .chat-close-btn:hover { color: #ff5555; }
        .no-msgs { text-align: center; margin-top: 100px; color: #222; font-family: 'JetBrains Mono'; font-size: 0.75rem; }
      `}</style>
    </div>
  );
};

export default ChatPage;