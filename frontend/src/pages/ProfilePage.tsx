import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Get current user and auth check function from global store
  const { user: me, checkAuth } = useAuthStore();

  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // --- States for editing profile fields ---
  const [isEditing, setIsEditing] = useState(false);
  const [discord, setDiscord] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [languages, setLanguages] = useState('');

  // Check if the profile being viewed belongs to the logged-in user
  const isOwnProfile = !id || Number(id) === me?.id;

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        let userData;
        if (isOwnProfile) {
          // Use data from local store if it's the owner
          userData = me;
        } else {
          // Fetch guest data from server if viewing someone else
          const token = localStorage.getItem(AUTH_TOKEN_KEY);
          const res = await axios.get(`http://localhost:3000/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          userData = res.data;
        }
        
        setTargetUser(userData);
        
        // Pre-fill edit fields with current profile data
        setDiscord(userData?.profile?.discord || '');
        setPronouns(userData?.profile?.pronouns || '');
        setLanguages(userData?.profile?.languages || '');
      } catch (err) {
        console.error("FAILED_TO_FETCH_SUBJECT", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id, me, isOwnProfile]);

  /**
   * Updates bio data (discord, pronouns, languages) to the backend
   */
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      
      // Matches the 'updateMe' logic in your backend controller/service
      await axios.patch('http://localhost:3000/api/users/me', {
        discord,
        pronouns,
        languages // Added languages field to the request
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh the global auth state to reflect changes across the app
      await checkAuth(); 
      setIsEditing(false);
      alert('SUCCESS: Bio-data synchronized.');
    } catch (err) {
      console.error("BIO_UPDATE_ERROR", err);
      alert('UPDATE_FAILED: System rejected the data uplink.');
    }
  };

  /**
   * Handles profile picture upload and database linking
   */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await axios.post('http://localhost:3000/api/upload/avatar', formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        },
      });
      
      // Wait briefly for file system sync then refresh UI
      setTimeout(async () => {
        await checkAuth(); 
        alert('SUCCESS: Identity uplink synchronized.');
      }, 500);
    } catch (err) {
      alert('UPLOAD_CRITICAL_ERROR');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: '#A2D2FF', padding: '20px', fontFamily: 'JetBrains Mono' }}>
        [ACCESSING_DATABASE...]
      </div>
    );
  }

  // Fallback to a styled SVG if no avatar is present
  const avatarSrc = targetUser?.profile?.avatarUrl 
    ? `http://localhost:3000${targetUser.profile.avatarUrl}?t=${Date.now()}` 
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E";

  return (
    <>
      <style>{`
        .hp-root { min-height: 100vh; background: #050505; color: #fff; font-family: 'Inter', sans-serif; }
        .hp-main { padding: 40px 1.5rem 2rem; max-width: 1000px; margin: auto; }
        .back-link { display: inline-block; margin-bottom: 2rem; color: #666; text-decoration: none; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; cursor: pointer; transition: color 0.2s; }
        .back-link:hover { color: #A2D2FF; }
        .hp-profile-hero { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; }
        .hp-hero-img { width: 80px; height: 80px; border-radius: 4px; object-fit: cover; border: 1px solid #444; }
        .hp-hero-text h2 { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; color: #fff; }
        .hp-label { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #A2D2FF; text-transform: uppercase; font-weight: 700; }
        .hp-card { background: #0a0a0a; border: 1px solid #222; padding: 1.5rem; border-radius: 4px; }
        .hp-btn-outline { display: block; width: 100%; padding: 10px; background: transparent; border: 1px solid #555; color: #fff; font-weight: 700; cursor: pointer; text-align: center; font-family: 'JetBrains Mono'; margin-top: 10px; font-size: 0.8rem; border-radius: 4px; }
        .hp-btn-outline:hover { border-color: #A2D2FF; color: #A2D2FF; }
        .hp-status-tag { font-size: 0.6rem; padding: 2px 8px; background: #333; color: #A2D2FF; border-radius: 2px; display: inline-block; margin-top: 5px; }
        
        /* Input styles for editing mode */
        .hp-input { background: #111; border: 1px solid #333; color: #fff; padding: 10px; width: 100%; font-family: 'JetBrains Mono'; margin-top: 8px; margin-bottom: 15px; border-radius: 4px; box-sizing: border-box; }
        .hp-input:focus { border-color: #A2D2FF; outline: none; }
      `}</style>

      <div className="hp-root">
        <div className="hp-main">
          <div className="back-link" onClick={() => navigate('/')}>
            &lt; [BACK_TO_DASHBOARD]
          </div>

          {/* Hero Section */}
          <div className="hp-profile-hero">
            <img src={avatarSrc} className="hp-hero-img" alt="avatar" />
            <div className="hp-hero-text">
              <div className="hp-label">{isOwnProfile ? "OWNER_IDENTITY" : "GUEST_VIEW"}</div>
              <h2>{targetUser?.username}</h2>
              
              {/* Cleaned Status Line */}
              <div className="hp-status-tag" style={{ marginTop: '8px', fontFamily: 'JetBrains Mono' }}>
                ID: {targetUser?.id} // 
                <span style={{ color: '#A2D2FF', marginLeft: '5px' }}>
                  {isOwnProfile ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              {/* Dedicated Location Box - Only visible when online */}
              {(isOwnProfile || targetUser?.profile?.location) && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '5px 10px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    borderRadius: '4px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.75rem'
                  }}>
                    <span style={{ color: '#A2D2FF', fontWeight: 'bold' }}>
                      {targetUser?.profile?.location || 'f0xxxx'} 
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grid Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: isOwnProfile ? '280px 1fr' : '1fr', gap: '2rem' }}>
            {isOwnProfile && (
              <aside>
                <div className="hp-card">
                  <span className="hp-label">Uplink_Config</span>
                  <p style={{ fontSize: '0.8rem', color: '#888', margin: '10px 0' }}>Modify your profile infos here</p>
                  
                  <input type="file" hidden id="avatar-input-profile" onChange={handleAvatarUpload} accept="image/*" />
                  <label htmlFor="avatar-input-profile" className="hp-btn-outline" style={{ cursor: 'pointer' }}>
                    {uploading ? 'UPLOADING...' : '[UPDATE_AVATAR]'}
                  </label>

                  <button className="hp-btn-outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? '[CANCEL_EDIT]' : '[EDIT_PROFILE]'}
                  </button>
                </div>
              </aside>
            )}

            <main>
              <div className="hp-card">
                <span className="hp-label">Profile infos</span>
                <div style={{ marginTop: '15px', fontFamily: 'JetBrains Mono', fontSize: '0.9rem' }}>
                  
                  {/* --- Name Section --- */}
                  <div style={{ marginTop: '5px' }}>
                    <p style={{ color: '#A2D2FF', fontSize: '0.7rem', fontWeight: 'bold' }}>NAME:</p>
                    <p style={{ marginTop: '5px' }}>{targetUser?.username}</p>
                  </div>
                  
                  {/* --- Discord Handle Section --- */}
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ color: '#A2D2FF', fontSize: '0.7rem', fontWeight: 'bold' }}>DISCORD_ID:</p>
                    {isEditing ? (
                      <input 
                        className="hp-input" 
                        value={discord} 
                        onChange={(e) => setDiscord(e.target.value)} 
                        placeholder="e.g. iamaid#0042"
                      />
                    ) : (
                      <p style={{ marginTop: '5px' }}>{targetUser?.profile?.discord || 'not set yet'}</p>
                    )}
                  </div>

                  {/* --- Pronouns Section --- */}
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ color: '#A2D2FF', fontSize: '0.7rem', fontWeight: 'bold' }}>PRONOUNS:</p>
                    {isEditing ? (
                      <input 
                        className="hp-input" 
                        value={pronouns} 
                        onChange={(e) => setPronouns(e.target.value)} 
                        placeholder="e.g. they/them"
                      />
                    ) : (
                      <p style={{ marginTop: '5px' }}>{targetUser?.profile?.pronouns || 'not specified'}</p>
                    )}
                  </div>

                  {/* --- Languages Section --- */}
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ color: '#A2D2FF', fontSize: '0.7rem', fontWeight: 'bold' }}>LANGUAGES:</p>
                    {isEditing ? (
                      <input 
                        className="hp-input" 
                        value={languages} 
                        onChange={(e) => setLanguages(e.target.value)} 
                        placeholder="e.g. C++, English, French" 
                      />
                    ) : (
                      <p style={{ marginTop: '5px' }}>{targetUser?.profile?.languages || 'not set yet'}</p>
                    )}
                  </div>

                  {/* Save button visible only during editing */}
                  {isEditing && (
                    <button 
                      className="hp-btn-outline" 
                      style={{ borderColor: '#A2D2FF', color: '#A2D2FF', marginTop: '20px' }} 
                      onClick={handleSaveProfile}
                    >
                      COMMIT_CHANGES
                    </button>
                  )}
                  
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;