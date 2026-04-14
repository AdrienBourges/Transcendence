import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';
import ChatPage from './ChatPage';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: me, checkAuth } = useAuthStore();
  
  const { joinConversations, setActiveConv } = useChatStore();

  // --- Profile States ---
  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  // --- Edit States ---
  const [isEditing, setIsEditing] = useState(false);
  const [discord, setDiscord] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [languages, setLanguages] = useState('');

  // --- Chat States ---
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<{ id: number, username: string } | null>(null);

  const isOwnProfile = !id || Number(id) === me?.id;
  const BACKEND_URL = 'http://localhost:3000';
  const BABY_BLUE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E";

  /**
   * Initial data fetch: profile info and friendship status
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
          const res = await axios.get(`${BACKEND_URL}/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          userData = res.data;

          const friendsRes = await axios.get(`${BACKEND_URL}/api/users/me/friends`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsFriend(friendsRes.data.some((f: any) => f.id === Number(id)));
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
   * Open chat: get/create conversation, join socket, open ChatPage modal
   */
  const handleOpenChat = async () => {
    if (isOwnProfile) return;
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      
      const convRes = await axios.post(`${BACKEND_URL}/api/conversations/private/${id}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const curId = Number(convRes.data.id);

      joinConversations([curId]);

      setActiveChatId(curId.toString());
      setActiveChatUser({ id: Number(id), username: targetUser?.username });
      setActiveConv(curId);
      setChatOpen(true);
    } catch (err: any) { 
      console.error("CHAT_INIT_ERR", err);
      alert(`CHAT_INIT_FAILED: ${err.response?.status || 'OFFLINE'}`); 
    }
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setActiveChatId(null);
    setActiveChatUser(null);
    setActiveConv(null);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await axios.patch(`${BACKEND_URL}/api/users/me`, { discord, pronouns, languages }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await checkAuth(); 
      setIsEditing(false);
    } catch (err) { alert('UPDATE_FAILED'); }
  };

  const handleAvatarUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await axios.post(`${BACKEND_URL}/api/upload/avatar`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setTimeout(async () => { await checkAuth(); }, 500);
    } catch (err) { alert('UPLOAD_ERROR'); } finally { setUploading(false); }
  };

  const handleAddFriend = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await axios.post(`${BACKEND_URL}/api/friends/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFriend(true);
    } catch (err) { alert('LINK_FAILED'); }
  };

  if (loading) return (
    <div style={{ color: '#A2D2FF', padding: '20px', fontFamily: 'JetBrains Mono' }}>
      [ACCESSING_DATABASE...]
    </div>
  );

  const avatarSrc = targetUser?.profile?.avatarUrl 
    ? `${BACKEND_URL}${targetUser.profile.avatarUrl}?t=${Date.now()}` 
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
        .chat-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .chat-window { background: #0a0a0a; border: 1px solid #333; width: 450px; height: 600px; border-radius: 4px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; }
      `}</style>

      <div className="hp-root">
        <div className="hp-main">
          <div style={{ color: '#666', fontSize: '0.75rem', cursor: 'pointer', marginBottom: '20px' }} onClick={() => navigate('/')}>
            &lt; [RETURN_DASHBOARD]
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
            <img src={avatarSrc} style={{ width: '100px', height: '100px', borderRadius: '4px', border: '1px solid #333', objectFit: 'cover' }} alt="Avatar" />
            <div>
              <div className="hp-label">{isOwnProfile ? "OWNER_ID" : "REMOTE_ENTITY"}</div>
              
              {/* Display username */}
              <h2 style={{ fontFamily: 'JetBrains Mono', fontSize: '1.8rem', margin: '5px 0' }}>
                {targetUser?.username}
              </h2>

              {/* Display user ID (visible to everyone) */}
              <div style={{ 
                fontFamily: 'JetBrains Mono', 
                fontSize: '0.8rem', 
                color: '#666', 
                marginTop: '-5px',
                marginBottom: '10px' 
              }}>
                <span style={{ color: '#A2D2FF' }}>UID_</span>
                {targetUser?.id?.toString().padStart(4, '0')} 
              </div>

              {!isOwnProfile && (
                <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                  <button className="hp-btn-outline" style={{ width: 'auto', padding: '6px 16px', borderColor: '#A2D2FF', color: '#A2D2FF' }} onClick={handleOpenChat}>
                    [COMMUNICATE]
                  </button>
                  {isFriend ? (
                    <span style={{ color: '#00FF9C', fontSize: '0.75rem', alignSelf: 'center' }}>● LINKED</span>
                  ) : (
                    <button className="hp-btn-outline" style={{ width: 'auto', padding: '6px 16px' }} onClick={handleAddFriend}>
                      [ADD_FRIENDNODE]
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isOwnProfile ? '280px 1fr' : '1fr', gap: '2rem' }}>
            {isOwnProfile && (
              <aside>
                <div className="hp-card">
                  <span className="hp-label">Config</span>
                  <input type="file" hidden id="avatar-input" onChange={handleAvatarUpload} accept="image/*" />
                  <label htmlFor="avatar-input" className="hp-btn-outline" style={{ cursor: 'pointer' }}>
                    {uploading ? 'SYNCING...' : '[UPDATE_AVATAR]'}
                  </label>
                  <button className="hp-btn-outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? '[CANCEL]' : '[EDIT_BIO]'}
                  </button>
                </div>
              </aside>
            )}
            <main className="hp-card">
              <span className="hp-label">Data_Field</span>
              <div style={{ marginTop: '20px', fontFamily: 'JetBrains Mono' }}>

                {/* Display system unique identifier in data section */}
                <p style={{ color: '#A2D2FF', fontSize: '0.7rem' }}>NODE_ID:</p>
                <p style={{ marginBottom: '20px', color: '#fff' }}>
                  #{targetUser?.id}
                </p>

                <p style={{ color: '#A2D2FF', fontSize: '0.7rem' }}>DISCORD:</p>
                {isEditing ? (
                  <input className="hp-input" value={discord} onChange={(e) => setDiscord(e.target.value)} />
                ) : (
                  <p style={{ marginBottom: '20px' }}>{targetUser?.profile?.discord || 'UNDEFINED'}</p>
                )}
                <p style={{ color: '#A2D2FF', fontSize: '0.7rem' }}>PRONOUNS:</p>
                {isEditing ? (
                  <input className="hp-input" value={pronouns} onChange={(e) => setPronouns(e.target.value)} />
                ) : (
                  <p style={{ marginBottom: '20px' }}>{targetUser?.profile?.pronouns || 'UNDEFINED'}</p>
                )}
                <p style={{ color: '#A2D2FF', fontSize: '0.7rem' }}>LANGUAGES:</p>
                {isEditing ? (
                  <input className="hp-input" value={languages} onChange={(e) => setLanguages(e.target.value)} />
                ) : (
                  <p>{targetUser?.profile?.languages || 'UNDEFINED'}</p>
                )}
                {isEditing && (
                  <button className="hp-btn-outline" style={{ borderColor: '#A2D2FF', color: '#A2D2FF' }} onClick={handleSaveProfile}>
                    SAVE_CHANGES
                  </button>
                )}
              </div>
            </main>
          </div>
        </div>

        {/* Chat Modal — reuses the same ChatPage component as HomePage */}
        {chatOpen && activeChatId && (
          <div className="chat-overlay" onClick={handleCloseChat}>
            <div className="chat-window" onClick={e => e.stopPropagation()}>
              <ChatPage
                conversationId={activeChatId}
                onClose={handleCloseChat}
                otherUser={activeChatUser}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;