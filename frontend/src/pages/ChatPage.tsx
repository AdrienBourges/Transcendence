import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';

interface ChatPageProps {
  conversationId?: string; 
  onClose?: () => void;    
}

const ChatPage: React.FC<ChatPageProps> = ({ conversationId: propsId, onClose }) => {
  const { id: urlId } = useParams<{ id: string }>();
  const activeId = propsId || urlId;
  const navigate = useNavigate();

  const { user: me } = useAuthStore();
  const { sockets, sendMessage, setActiveConv } = useChatStore();

  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Key point: store the other party's ID and username
  const [otherUserInfo, setOtherUserInfo] = useState<{id: number, username: string} | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const BACKEND_URL = 'http://localhost:3000';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  /**
   * Initialize chat: fetch messages and lock the other party's identity
   */
  useEffect(() => {
    if (!activeId || !me?.id) return;

    const initChat = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        setActiveConv(Number(activeId));

        // 1. First fetch the message list
        const res = await axios.get(`${BACKEND_URL}/api/conversations/${activeId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // 2. Try to extract the other party's info from messages (if sender data is nested)
        const themMsg = res.data.find((m: any) => m.senderId !== me.id);
        if (themMsg && themMsg.sender) {
          setOtherUserInfo({
            id: themMsg.senderId,
            username: themMsg.sender.username
          });
        } 
        // 3. Fallback: if no data in messages, get it from conversation metadata (if your backend supports it)
        else {
           // If the previous 404 was due to this endpoint not existing, we manually parse activeId or rely on socket updates below
           console.log("No sender info in messages, waiting for socket or metadata...");
        }

        const formattedMsgs = res.data.map((msg: any) => ({
          senderId: msg.senderId,
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
    return () => setActiveConv(null);
  }, [activeId, me?.id, setActiveConv]);

  /**
   * Real-time message listener: dynamically update the other party's info
   */
  useEffect(() => {
    const convIdNum = Number(activeId);
    const currentSocket = sockets.get(convIdNum);
    if (!currentSocket) return;

    const handleNewMessage = (msg: any) => {
      if (Number(msg.convId) === convIdNum) {
        setChatHistory(prev => [...prev, {
          sender: msg.senderId === me?.id ? 'me' : 'them',
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        // If we still don't have the other party's info when receiving a message, fill it immediately from the message payload
        if (!otherUserInfo && msg.senderId !== me?.id && msg.sender) {
          setOtherUserInfo({ id: msg.senderId, username: msg.sender.username });
        }
      }
    };

    currentSocket.on('message:new', handleNewMessage);
    return () => currentSocket.off('message:new', handleNewMessage);
  }, [sockets, activeId, me?.id, otherUserInfo]);

  // --- Key fix: force navigation function ---
  const handleJumpToProfile = () => {
    // If otherUserInfo is not loaded yet, try to find the first senderId that is not the current user from chatHistory
    let targetId = otherUserInfo?.id;
    
    if (!targetId) {
      const lastThemMsg = chatHistory.find(m => m.sender === 'them');
      if (lastThemMsg) targetId = lastThemMsg.senderId;
    }

    if (targetId) {
      console.log("Jumping to profile of node:", targetId);
      if (onClose) onClose(); // Must close the modal first
      navigate(`/profile/${targetId}`);
    } else {
      alert("ERROR: NODE_IDENTITY_NOT_FOUND. Need at least one message to identify peer.");
    }
  };

  const handleSend = () => {
    if (!messageInput.trim()) return;
    sendMessage(messageInput); 
    setMessageInput('');
  };

  if (loading) return <div style={{ color: '#A2D2FF', padding: '20px', fontFamily: 'JetBrains Mono' }}>[SYNCING_SECURE_CHANNEL...]</div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title-area" onClick={handleJumpToProfile}>
          <span className="chat-label">
            <span style={{ color: '#444' }}>&gt; </span>
            {otherUserInfo ? (
              <>NODE: <span className="highlight-user">{otherUserInfo.username}</span></>
            ) : (
              <>CHANNEL_ID: <span className="highlight-user">{activeId}</span></>
            )}
          </span>
          <span className="jump-hint">[ACCESS_DATA]</span>
        </div>
        
        {onClose && (
          <button onClick={onClose} className="chat-close-btn">[TERMINATE]</button>
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
        .chat-container { height: 100%; display: flex; flex-direction: column; background: #0a0a0a; border-radius: 4px; overflow: hidden; border: 1px solid #222; }
        .chat-header { padding: 12px 15px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; background: #0f0f0f; cursor: default; }
        .chat-title-area { display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; }
        .chat-label { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #A2D2FF; }
        .highlight-user { color: #fff; margin-left: 5px; transition: 0.2s; }
        .chat-title-area:hover .highlight-user { color: #A2D2FF; text-decoration: underline; }
        .chat-title-area:hover .jump-hint { opacity: 1; transform: translateX(5px); }
        .jump-hint { font-size: 0.55rem; color: #444; opacity: 0; transition: 0.3s; font-family: 'JetBrains Mono'; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; background: #050505; }
        .msg-bubble { max-width: 80%; padding: 10px 14px; border-radius: 4px; font-size: 0.8rem; line-height: 1.4; }
        .msg-bubble.me { align-self: flex-end; background: #111; border: 1px solid #A2D2FF; color: #A2D2FF; }
        .msg-bubble.them { align-self: flex-start; background: #0a0a0a; border: 1px solid #333; color: #eee; }
        .msg-time { font-size: 0.5rem; opacity: 0.3; margin-top: 5px; text-align: right; }
        .chat-input-area { padding: 15px; border-top: 1px solid #222; display: flex; gap: 10px; background: #0a0a0a; }
        .chat-input-area input { flex: 1; background: #000; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 2px; font-family: 'JetBrains Mono'; font-size: 0.75rem; outline: none; }
        .chat-input-area button { background: #A2D2FF; border: none; padding: 0 15px; border-radius: 2px; cursor: pointer; font-weight: bold; font-family: 'JetBrains Mono'; font-size: 0.7rem; }
        .chat-close-btn { background: none; border: none; color: #444; cursor: pointer; font-size: 0.6rem; font-family: 'JetBrains Mono'; }
        .chat-close-btn:hover { color: #ff5555; }
        .no-msgs { text-align: center; margin-top: 40px; color: #222; font-family: 'JetBrains Mono'; font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default ChatPage;