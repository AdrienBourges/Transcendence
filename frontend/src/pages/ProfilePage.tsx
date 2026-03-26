import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuthStore } from '@/store/useAuthStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Initialize navigation hook
  const { user: me, checkAuth } = useAuthStore();

  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const isOwnProfile = !id || Number(id) === me?.id;

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        if (isOwnProfile) {
          setTargetUser(me);
        } else {
          const token = localStorage.getItem(AUTH_TOKEN_KEY);
          const res = await axios.get(`http://localhost:3000/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTargetUser(res.data);
        }
      } catch (err) {
        console.error("FAILED_TO_FETCH_SUBJECT", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id, me, isOwnProfile]);

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

  if (loading) return <div style={{ color: '#A2D2FF', padding: '20px', fontFamily: 'JetBrains Mono' }}>[ACCESSING_DATABASE...]</div>;

  const avatarSrc = targetUser?.profile?.avatarUrl 
    ? `http://localhost:3000${targetUser.profile.avatarUrl}?t=${Date.now()}` 
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E";

  return (
    <>
      <style>{`
        .hp-root { min-height: 100vh; background: #050505; color: #fff; font-family: 'Inter', sans-serif; }
        .hp-main { padding: 40px 1.5rem 2rem; max-width: 1000px; margin: auto; }
        
        /* Back button styles */
        .back-link {
          display: inline-block;
          margin-bottom: 2rem;
          color: #666;
          text-decoration: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .back-link:hover { color: #A2D2FF; }

        .hp-profile-hero { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; }
        .hp-hero-img { width: 80px; height: 80px; border-radius: 4px; object-fit: cover; border: 1px solid #444; }
        .hp-hero-text h2 { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; color: #fff; }
        .hp-label { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #A2D2FF; text-transform: uppercase; font-weight: 700; }
        .hp-card { background: #0a0a0a; border: 1px solid #222; padding: 1.5rem; border-radius: 4px; }
        .hp-btn-outline { display: block; width: 100%; padding: 10px; background: transparent; border: 1px solid #555; color: #fff; font-weight: 700; cursor: pointer; text-align: center; font-family: 'JetBrains Mono'; }
        .hp-btn-outline:hover { border-color: #A2D2FF; color: #A2D2FF; }
        .hp-status-tag { font-size: 0.6rem; padding: 2px 6px; background: #333; color: #A2D2FF; border-radius: 2px; display: inline-block; margin-top: 5px; }
      `}</style>

      <div className="hp-root">
        <div className="hp-main">
          {/* Back button */}
          <div className="back-link" onClick={() => navigate('/')}>
            &lt; [BACK_TO_DASHBOARD]
          </div>

          <div className="hp-profile-hero">
            <img src={avatarSrc} className="hp-hero-img" alt="avatar" />
            <div className="hp-hero-text">
              <div className="hp-label">
                {isOwnProfile ? "OWNER_IDENTITY" : "GUEST_VIEW"}
              </div>
              <h2>{targetUser?.username}</h2>
              <div className="hp-status-tag">ID: {targetUser?.id} // {isOwnProfile ? 'ONLINE' : 'OFFLINE'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isOwnProfile ? '280px 1fr' : '1fr', gap: '2rem' }}>
            {isOwnProfile && (
              <aside>
                <div className="hp-card">
                  <span className="hp-label">Uplink_Config</span>
                  <p style={{ fontSize: '0.8rem', color: '#888', margin: '10px 0' }}>Modify your visual trace in the grid.</p>
                  <input type="file" hidden id="avatar-input-profile" onChange={handleAvatarUpload} accept="image/*" />
                  <label htmlFor="avatar-input-profile" className="hp-btn-outline" style={{ cursor: 'pointer' }}>
                    {uploading ? 'UPLOADING...' : '[UPDATE_AVATAR]'}
                  </label>
                </div>
              </aside>
            )}

            <main>
              <div className="hp-card">
                <span className="hp-label">System_Data</span>
                <div style={{ marginTop: '15px', fontFamily: 'JetBrains Mono', fontSize: '0.9rem' }}>
                  <p>NAME: {targetUser?.username}</p>
                  <p style={{ marginTop: '10px', color: '#444' }}>// No further public data available.</p>
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