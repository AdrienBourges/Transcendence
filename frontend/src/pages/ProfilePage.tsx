import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: me, checkAuth } = useAuthStore();

  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  // --- Profile Edit States ---
  const [isEditing, setIsEditing] = useState(false);
  const [discord, setDiscord] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [languages, setLanguages] = useState('');

  // --- Chat States ---
  const [chatOpen, setChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]); 

  const isOwnProfile = !id || Number(id) === me?.id;
  const BABY_BLUE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E";

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

  // --- Logic Functions ---

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
      alert('SUCCESS: Bio-data synchronized.');
    } catch (err) {
      alert('UPDATE_FAILED');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setTimeout(async () => { 
        await checkAuth(); 
        alert('SUCCESS: Identity uplink synchronized.'); 
      }, 500);
    } catch (err) {
      alert('UPLOAD_ERROR');
    } finally {
      setUploading(false);
    }
  };

  const handleAddFriend = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await axios.post(`http://localhost:3000/api/friends/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFriend(true);
    } catch (err) { alert('LINK_FAILED'); }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const newMsg = { sender: 'me', text: messageInput, time: new Date().toLocaleTimeString() };
    setChatHistory([...chatHistory, newMsg]);
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
        .hp-input:focus { border-color: #A2D2FF; outline: none; }
        
        .chat-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .chat-window { background: #0a0a0a; border: 1px solid #333; width: 400px; height: 500px; display: flex; flex-direction: column; border-radius: 4px; }
        .chat-header { padding: 15px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .chat-msg { max-width: 80%; padding: 8px 12px; border-radius: 4px; font-size: 0.85rem; }
        .chat-msg.me { align-self: flex-end; background: #1a1a1a; border: 1px solid #A2D2FF; color: #A2D2FF; }
        .chat-msg.them { align-self: flex-start; background: #111; border: 1px solid #333; }
        .chat-footer { padding: 15px; border-top: 1px solid #222; display: flex; gap: 10px; }
        .chat-input-field { flex: 1; background: #050505; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 2px; font-family: 'JetBrains Mono'; }
      `}</style>

      <div className="hp-root">
        <div className="hp-main">
          <div style={{ color: '#666', fontSize: '0.75rem', cursor: 'pointer', marginBottom: '20px' }} onClick={() => navigate('/')}>&lt; [BACK_TO_DASHBOARD]</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <img src={avatarSrc} style={{ width: '80px', height: '80px', borderRadius: '4px', border: '1px solid #444', objectFit: 'cover' }} />
            <div>
              <div className="hp-label">{isOwnProfile ? "OWNER_IDENTITY" : "GUEST_VIEW"}</div>
              <h2 style={{ fontFamily: 'JetBrains Mono', fontSize: '1.5rem' }}>{targetUser?.username}</h2>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {!isOwnProfile && !isFriend && (
                  <button className="hp-btn-outline" style={{ width: 'auto', marginTop: 0, padding: '4px 12px' }} onClick={handleAddFriend}>[ESTABLISH_LINK]</button>
                )}
                {isFriend && !isOwnProfile && (
                  <button className="hp-btn-outline" style={{ width: 'auto', marginTop: 0, padding: '4px 12px', borderColor: '#A2D2FF', color: '#A2D2FF' }} onClick={() => setChatOpen(true)}>[COMMUNICATE]</button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isOwnProfile ? '280px 1fr' : '1fr', gap: '2rem' }}>
            {isOwnProfile && (
              <aside>
                <div className="hp-card">
                  <span className="hp-label">Uplink_Config</span>
                  <input type="file" hidden id="avatar-input" onChange={handleAvatarUpload} accept="image/*" />
                  <label htmlFor="avatar-input" className="hp-btn-outline" style={{ cursor: 'pointer' }}>
                    {uploading ? 'UPLOADING...' : '[UPDATE_AVATAR]'}
                  </label>
                  <button className="hp-btn-outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? '[CANCEL_EDIT]' : '[EDIT_PROFILE]'}
                  </button>
                </div>
              </aside>
            )}

            <main className="hp-card">
              <span className="hp-label">Identity_Data</span>
              <div style={{ marginTop: '20px', fontFamily: 'JetBrains Mono' }}>
                
                <p style={{ color: '#A2D2FF', fontSize: '0.7rem' }}>DISCORD_ID:</p>
                {isEditing ? (
                  <input className="hp-input" value={discord} onChange={(e) => setDiscord(e.target.value)} />
                ) : (
                  <p style={{ marginBottom: '15px' }}>{targetUser?.profile?.discord || 'undefined'}</p>
                )}

                <p style={{ color: '#A2D2FF', fontSize: '0.7rem' }}>PRONOUNS:</p>
                {isEditing ? (
                  <input className="hp-input" value={pronouns} onChange={(e) => setPronouns(e.target.value)} />
                ) : (
                  <p style={{ marginBottom: '15px' }}>{targetUser?.profile?.pronouns || 'not specified'}</p>
                )}

                <p style={{ color: '#A2D2FF', fontSize: '0.7rem' }}>LANGUAGES:</p>
                {isEditing ? (
                  <input className="hp-input" value={languages} onChange={(e) => setLanguages(e.target.value)} />
                ) : (
                  <p>{targetUser?.profile?.languages || 'none'}</p>
                )}

                {isEditing && (
                  <button className="hp-btn-outline" style={{ borderColor: '#A2D2FF', color: '#A2D2FF', marginTop: '20px' }} onClick={handleSaveProfile}>
                    COMMIT_CHANGES
                  </button>
                )}
              </div>
            </main>
          </div>
        </div>

        {/* --- Chat Modal --- */}
        {chatOpen && (
          <div className="chat-overlay" onClick={() => setChatOpen(false)}>
            <div className="chat-window" onClick={e => e.stopPropagation()}>
              <div className="chat-header">
                <span className="hp-label">Channel: {targetUser?.username}</span>
                <span style={{ cursor: 'pointer', color: '#444' }} onClick={() => setChatOpen(false)}>[X]</span>
              </div>
              <div className="chat-body">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`chat-msg ${msg.sender === 'me' ? 'me' : 'them'}`}>
                    {msg.text}
                    <div style={{ fontSize: '0.5rem', opacity: 0.5, marginTop: '4px' }}>{msg.time}</div>
                  </div>
                ))}
              </div>
              <div className="chat-footer">
                <input className="chat-input-field" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                <button onClick={handleSendMessage} style={{ background: '#A2D2FF', border: 'none', padding: '0 10px', borderRadius: '2px' }}>&gt;</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;