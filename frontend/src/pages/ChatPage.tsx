import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';

interface ChatPageProps {
    conversationId?: string;
    onClose?: () => void;
    otherUser?: { id: number, username: string, profile?: any } | null;
}

const ChatPage: React.FC<ChatPageProps> = ({ conversationId: propsId, onClose, otherUser: propsOtherUser }) => {
    const { id: urlId } = useParams<{ id: string }>();
    const activeId = propsId || urlId;
    const navigate = useNavigate();

    const { user: me } = useAuthStore();
    const { sockets, sendMessage, setActiveConv } = useChatStore();

    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [otherUserInfo, setOtherUserInfo] = useState<{ id: number, username: string } | null>(propsOtherUser || null);
    const [isPartnerOnline, setIsPartnerOnline] = useState<boolean>(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const BACKEND_URL = 'http://localhost:3000';

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    // Sync otherUserInfo if prop changes
    useEffect(() => {
        if (propsOtherUser) {
            setOtherUserInfo(propsOtherUser);
        }
    }, [propsOtherUser]);

    // Reset online indicator when switching chat / partner
    useEffect(() => {
        setIsPartnerOnline(false);
    }, [activeId, otherUserInfo?.id]);

    /**
     * Initialize chat: fetch message history and set active conversation
     */
    useEffect(() => {
        if (!activeId || !me?.id) return;

        const initChat = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem(AUTH_TOKEN_KEY);
                setActiveConv(Number(activeId));

                const res = await axios.get(`${BACKEND_URL}/api/conversations/${activeId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Only extract from messages if not already provided via props
                if (!propsOtherUser) {
                    const themMsg = res.data.find((m: any) => m.senderId !== me.id);
                    if (themMsg && themMsg.sender) {
                        setOtherUserInfo({ id: themMsg.senderId, username: themMsg.sender.username });
                    }
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
    }, [activeId, me?.id, setActiveConv, propsOtherUser]);

    /**
     * Real-time message + presence listeners
     */
    useEffect(() => {
        const convIdNum = Number(activeId);
        const currentSocket = sockets.get(convIdNum);
        if (!currentSocket) return;

        const handleNewMessage = (msg: any) => {
            if (Number(msg.convId) === convIdNum) {
                setChatHistory(prev => [...prev, {
                    senderId: msg.senderId,
                    sender: msg.senderId === me?.id ? 'me' : 'them',
                    text: msg.content,
                    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);

                // Fill other user info from live message if still missing
                if (!otherUserInfo && msg.senderId !== me?.id && msg.sender) {
                    setOtherUserInfo({ id: msg.senderId, username: msg.sender.username });
                }
            }
        };

        const handlePresenceUpdate = (data: { userId: number; online: boolean }) => {
            if (data.userId === otherUserInfo?.id) {
                setIsPartnerOnline(data.online);
                console.log(`👁 [PRESENCE] User ${data.userId} is now ${data.online ? 'ONLINE' : 'OFFLINE'}`);
            }
        };

        currentSocket.on('message:new', handleNewMessage);
        currentSocket.on('presence:update', handlePresenceUpdate);

        // Ask backend for current presence state after listeners are attached
        currentSocket.emit('presence:request');

        return () => {
            currentSocket.off('message:new', handleNewMessage);
            currentSocket.off('presence:update', handlePresenceUpdate);
        };
    }, [sockets, activeId, me?.id, otherUserInfo]);

    /**
     * Navigate to the other user's profile page
     */
    const handleJumpToProfile = () => {
        let targetId = otherUserInfo?.id;

        if (!targetId) {
            const lastThemMsg = chatHistory.find(m => m.sender === 'them');
            if (lastThemMsg) targetId = lastThemMsg.senderId;
        }

        if (targetId) {
            if (onClose) onClose();
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

    if (loading) return (
        <div style={{ color: '#A2D2FF', padding: '20px', fontFamily: 'JetBrains Mono' }}>
            [SYNCING_SECURE_CHANNEL...]
        </div>
    );

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="chat-title-area" onClick={handleJumpToProfile}>
                    <div>
                        <span className="chat-label">
                            <span style={{ color: '#444' }}>&gt; </span>
                            {otherUserInfo ? (
                                <>NODE: <span className="highlight-user">{otherUserInfo.username}</span></>
                            ) : (
                                <>CHANNEL_ID: <span className="highlight-user">{activeId}</span></>
                            )}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: isPartnerOnline ? '#4ade80' : '#444',
                                boxShadow: isPartnerOnline ? '0 0 8px #4ade80' : 'none',
                                transition: '0.3s'
                            }} />
                            <span style={{
                                fontSize: '0.55rem',
                                color: isPartnerOnline ? '#4ade80' : '#444',
                                fontFamily: 'JetBrains Mono',
                                textTransform: 'uppercase',
                                transition: '0.3s'
                            }}>
                                {isPartnerOnline ? 'LINK JUST ACTIVE' : 'LINK INACTIVE'}
                            </span>
                        </div>
                    </div>
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
        .chat-header { padding: 12px 15px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; background: #0f0f0f; }
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
        .chat-input-area input:focus { border-color: #A2D2FF; }
        .chat-input-area button { background: #A2D2FF; border: none; padding: 0 15px; border-radius: 2px; cursor: pointer; font-weight: bold; font-family: 'JetBrains Mono'; font-size: 0.7rem; }
        .chat-close-btn { background: none; border: none; color: #444; cursor: pointer; font-size: 0.6rem; font-family: 'JetBrains Mono'; }
        .chat-close-btn:hover { color: #ff5555; }
        .no-msgs { text-align: center; margin-top: 40px; color: #222; font-family: 'JetBrains Mono'; font-size: 0.7rem; }
      `}</style>
        </div>
    );
};

export default ChatPage;
