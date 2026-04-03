import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';

// 2. Define component as a standard function instead of React.FC to avoid default export issues
const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: me, checkAuth } = useAuthStore();
  
  // Get socket instance and actions from zustand store
  const { socket, connect, sendMessage } = useChatStore();

  // --- State Management ---
  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  // --- Profile Edit States ---
  const [isEditing, setIsEditing] = useState(false);
  const [discord, setDiscord] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [languages, setLanguages] = useState('');

  // --- Chat/Communication States ---
  const [chatOpen, setChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]); 
  const [conversationId, setConversationId] = useState<number | null>(null);

  // --- Refs ---
  const scrollRef = useRef<HTMLDivElement>(null);

  const isOwnProfile = !id || Number(id) === me?.id;
  const BABY_BLUE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E";

  /**
   * Effect: Auto-scroll to bottom when chat history updates or modal opens
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, chatOpen]);

  /**
   * Effect: Real-time Message Listener 
   * Listens for "message:new" event from backend
   */
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      // Backend payload structure: { convId, senderId, content, createdAt }
      if (msg.convId === conversationId) {
        setChatHistory(prev => [...prev, {
          sender: msg.senderId === me?.id ? 'me' : 'them',
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    };

    socket.on('message:new', handleNewMessage);
    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [socket, conversationId, me?.id]);

  /**
   * Initial Data Fetching: User profile and friendship status
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        let userData;

        if (isOwnProfile) {
          userData = me;
        } else {
          const res = await axios.get(`http://localhost:3000/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          userData = res.data;

          const friendsRes = await axios.get('http://localhost:3000/api/users/me/friends', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const alreadyFriend = friendsRes.data.some((f: any) => f.id === Number(id));
          setIsFriend(alreadyFriend);
        }
        
        setTargetUser(userData);
        setDiscord(userData?.profile?.discord || '');
        setPronouns(userData?.profile?.pronouns || '');
        setLanguages(userData?.profile?.languages || '');
      } catch (err) {
        console.error("DATA_FETCH_ERROR", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, me, isOwnProfile]);

  /**
   * Action: Patch profile data to backend
   */
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await axios.patch('http://localhost:3000/api/users/me', {
        discord, pronouns, languages
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await checkAuth(); 
      setIsEditing(false);
    } catch (err) {
      alert('UPDATE_FAILED');
    }
  };

  /**
   * Action: Upload profile picture
   */
  const handleAvatarUpload = async (e: any) => { // Use 'any' for event to avoid importing React.ChangeEvent
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await axios.post('http://localhost:3000/api/upload/avatar', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setTimeout(async () => { await checkAuth(); }, 500);
    } catch (err) {
      alert('UPLOAD_ERROR');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Action: Send friend request
   */
  const handleAddFriend = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await axios.post(`http://localhost:3000/api/friends/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFriend(true);
    } catch (err) { alert('LINK_FAILED'); }
  };

  /**
   * Action: Initialize Chat (API Call + Socket Connection)
   * Fixed path to match backend: /api/conversations/private/:id
   */
  const handleOpenChat = async () => {
    if (isOwnProfile) return;
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      
      // 1. Get/Create conversation ID using the correct private route
      const convRes = await axios.post(`http://localhost:3000/api/conversations/private/${id}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const curId = convRes.data.id;
      setConversationId(curId);

      // 2. Fetch Message History
      const msgRes = await axios.get(`http://localhost:3000/api/conversations/${curId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setChatHistory(msgRes.data.map((msg: any) => ({
        sender: msg.senderId === me?.id ? 'me' : 'them',
        text: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })));
      
      // 3. Trigger Socket connection with conversationId for handshake validation
      if (connect) connect(curId);
      
      setChatOpen(true);
    } catch (err: any) { 
      console.error("CHAT_INIT_ERR", err);
      alert(`CHAT_INIT_FAILED: ${err.response?.status || 'OFFLINE'}`); 
    }
  };

  /**
   * Action: Send Message via Socket (Uses "message:send" event)
   */
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessage(messageInput);
    setMessageInput('');
  };

  if (loading) return <div style={{ color: '#A2D2FF', padding: '20px', fontFamily: 'JetBrains Mono' }}>[ACCESSING_DATABASE...]</div>;

  const avatarSrc = targetUser?.profile?.avatarUrl 
    ? `http://localhost:3000${targetUser.profile.avatarUrl}?t=${Date.now()}` 
    : BABY_BLUE_SVG;

  return (
    <>
      <style>{`
        .hp-root { min-height: 100vh; background: #050505; color: #fff; font-family: 'Inter', sans-serif; }
        .hp-main { padding: 40px 1.5rem 2rem; max-width: 1000px; margin: auto; }
        .hp-label { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #A2D2FF; text-transform: uppercase; font-weight: 700; }
        .hp-card { background: #0a0a0a; border: 1px solid #222; padding: 1.5rem; border-radius: 4px; }
        .hp-btn-outline { display: block; width: 100%; padding: 10px; background: transparent; border: 1px solid #555; color: #fff; font-weight: 700; cursor: pointer; text-align: center; font-family: 'JetBrains Mono'; margin-top: 10px; font-size: 0.8rem; border-radius: 4px; transition: 0.2s; }
        .hp-btn-outline:hover { border-color: #A2D2FF; color: #A2D2FF; }
        .hp-input { background: #111; border: 1px solid #333; color: #fff; padding: 10px; width: 100%; font-family: 'JetBrains Mono'; margin-top: 8px; margin-bottom: 15px; border-radius: 4px; box-sizing: border-box; }
        
        @keyframes breathe {
          0% { opacity: 0.3; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(0.95); }
        }
        .status-active { color: #00FF9C; font-size: 0.75rem; display: flex; align-items: center; gap: 8px; font-family: 'JetBrains Mono'; }
        .status-dot { width: 8px; height: 8px; background: #00FF9C; border-radius: 50%; box-shadow: 0 0 8px #00FF9C; animation: breathe 2s infinite ease-in-out; }

        .chat-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .chat-window { background: #0a0a0a; border: 1px solid #333; width: 420px; height: 550px; display: flex; flex-direction: column; border-radius: 4px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .chat-header { padding: 15px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
        .chat-msg { max-width: 80%; padding: 10px 14px; border-radius: 4px; font-size: 0.85rem; line-height: 1.4; }
        .chat-msg.me { align-self: flex-end; background: #1a1a1a; border: 1px solid #A2D2FF; color: #A2D2FF; }
        .chat-msg.them { align-self: flex-start; background: #111; border: 1px solid #333; color: #eee; }
      `}</style>

      <div className="hp-root">
        <div className="hp-main">
          <div style={{ color: '#666', fontSize: '0.75rem', cursor: 'pointer', marginBottom: '20px' }} onClick={() => navigate('/')}>
            &lt; [SYSTEM_RETURN_DASHBOARD]
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
            <img src={avatarSrc} style={{ width: '100px', height: '100px', borderRadius: '4px', border: '1px solid #333', objectFit: 'cover' }} alt="Avatar" />
            <div>
              <div className="hp-label">{isOwnProfile ? "OWNER_ID" : "EXTERNAL_ENTITY"}</div>
              <h2 style={{ fontFamily: 'JetBrains Mono', fontSize: '1.8rem', margin: '5px 0' }}>{targetUser?.username}</h2>
              
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px', alignItems: 'center' }}>
                {!isOwnProfile && (
                  <>
                    <button 
                      className="hp-btn-outline" 
                      style={{ width: 'auto', marginTop: 0, padding: '6px 16px', borderColor: '#A2D2FF', color: '#A2D2FF' }} 
                      onClick={handleOpenChat}
                    >
                      [COMMUNICATE]
                    </button>

                    {isFriend ? (
                      <div className="status-active">
                        <div className="status-dot"></div>
                        LINKED
                      </div>
                    ) : (
                      <button className="hp-btn-outline" style={{ width: 'auto', marginTop: 0, padding: '6px 16px' }} onClick={handleAddFriend}>
                        [ESTABLISH_LINK]
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isOwnProfile ? '280px 1fr' : '1fr', gap: '2rem' }}>
            {isOwnProfile && (
              <aside>
                <div className="hp-card">
                  <span className="hp-label">Configuration</span>
                  <input type="file" hidden id="avatar-input" onChange={handleAvatarUpload} accept="image/*" />
                  <label htmlFor="avatar-input" className="hp-btn-outline" style={{ cursor: 'pointer' }}>
                    {uploading ? 'SYNCHRONIZING...' : '[UPDATE_AVATAR]'}
                  </label>
                  <button className="hp-btn-outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? '[ABORT_CHANGES]' : '[MODIFY_BIO]'}
                  </button>
                </div>
              </aside>
            )}

            <main className="hp-card">
              <span className="hp-label">Entity_Data_Stream</span>
              <div style={{ marginTop: '20px', fontFamily: 'JetBrains Mono' }}>
                <p style={{ color: '#A2D2FF', fontSize: '0.7rem' }}>DISCORD_ID:</p>
                {isEditing ? (
                  <input className="hp-input" value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="Username#0000" />
                ) : (
                  <p style={{ marginBottom: '20px' }}>{targetUser?.profile?.discord || 'UNSET'}</p>
                )}

                <p style={{ color: '#A2D2FF', fontSize: '0.7rem' }}>PRONOUNS:</p>
                {isEditing ? (
                  <input className="hp-input" value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="they/them" />
                ) : (
                  <p style={{ marginBottom: '20px' }}>{targetUser?.profile?.pronouns || 'UNSET'}</p>
                )}

                <p style={{ color: '#A2D2FF', fontSize: '0.7rem' }}>LANGUAGES:</p>
                {isEditing ? (
                  <input className="hp-input" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="JS, C++, Rust" />
                ) : (
                  <p>{targetUser?.profile?.languages || 'UNSET'}</p>
                )}

                {isEditing && (
                  <button className="hp-btn-outline" style={{ borderColor: '#A2D2FF', color: '#A2D2FF', marginTop: '20px' }} onClick={handleSaveProfile}>
                    EXECUTE_PATCH
                  </button>
                )}
              </div>
            </main>
          </div>
        </div>

        {/* --- Communication Terminal (Modal) --- */}
        {chatOpen && (
          <div className="chat-overlay" onClick={() => setChatOpen(false)}>
            <div className="chat-window" onClick={e => e.stopPropagation()}>
              <div className="chat-header">
                <span className="hp-label">Secure_Channel: {targetUser?.username}</span>
                <span style={{ cursor: 'pointer', color: '#666' }} onClick={() => setChatOpen(false)}>[CLOSE]</span>
              </div>
              
              <div className="chat-body" ref={scrollRef}>
                {chatHistory.length > 0 ? chatHistory.map((msg, i) => (
                  <div key={i} className={`chat-msg ${msg.sender === 'me' ? 'me' : 'them'}`}>
                    {msg.text}
                    <div style={{ fontSize: '0.55rem', opacity: 0.4, marginTop: '6px', textAlign: 'right' }}>{msg.time}</div>
                  </div>
                )) : (
                  <div style={{ color: '#222', fontSize: '0.75rem', textAlign: 'center', marginTop: '100px', fontFamily: 'JetBrains Mono' }}>
                    &gt; NO_LOGS_FOUND. AWAKEN_CONNECTION?
                  </div>
                )}
              </div>

              <div style={{ padding: '15px', borderTop: '1px solid #222', display: 'flex', gap: '10px' }}>
                <input 
                  style={{ flex: 1, background: '#050505', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '2px', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}
                  placeholder="Input command..." 
                  value={messageInput} 
                  onChange={(e) => setMessageInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                />
                <button 
                  onClick={handleSendMessage} 
                  style={{ background: '#A2D2FF', border: 'none', padding: '0 15px', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  SEND
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;