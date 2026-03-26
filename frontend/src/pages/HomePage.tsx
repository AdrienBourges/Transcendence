import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';

const HomePage: React.FC = () => {
  // Access global user state and authentication check
  const { user, checkAuth } = useAuthStore();

  // Local UI states for interaction and sections
  const [uploading, setUploading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'messages' | 'groups'>('dashboard');

  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Log out by removing token and redirecting to login
  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.href = '/login';
  };

  /**
   * Handles image upload and synchronization with the backend
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
      
      // Artificial delay to ensure file system sync before re-fetching auth state
      setTimeout(async () => {
        await checkAuth(); 
        alert('SUCCESS: Identity image uplinked.');
      }, 800);

    } catch (err: any) {
      alert(`UPLOAD_ERROR: ${err.response?.status || 'Network Error'}`);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Cache-busting avatar source. If no avatar exists, returns a stylized SVG placeholder.
   */
  const avatarSrc = user?.profile?.avatarUrl 
    ? `http://localhost:3000${user.profile.avatarUrl}?t=${Date.now()}` 
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E";
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050505; color: #ffffff; font-family: 'Inter', sans-serif; }

        .hp-root { min-height: 100vh; }

        /* NAVBAR */
        .hp-nav {
          position: fixed; top: 0; left: 0; right: 0; height: 55px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.5rem; background: rgba(0,0,0,0.9); border-bottom: 1px solid #222; z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .hp-nav-logo { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.85rem; color: #A2D2FF; letter-spacing: 1px; }

        .hp-nav-links { display: flex; gap: 0.5rem; }

        .hp-nav-btn {
          background: none; border: none; padding: 0.4rem 1rem; font-size: 0.7rem;
          color: #666; cursor: pointer; font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s;
        }
        .hp-nav-btn:hover { color: #fff; }
        .hp-nav-btn.active { color: #A2D2FF; background: #111; border-radius: 2px; }

        .hp-nav-right { position: relative; display: flex; align-items: center; }
        .hp-avatar-trigger {
          background: #111; border: 1px solid #333; cursor: pointer;
          padding: 2px; border-radius: 4px; display: flex; align-items: center; gap: 8px;
        }
        
        .hp-dropdown {
          position: absolute; top: 45px; right: 0; width: 180px; 
          background: #0a0a0a; border: 1px solid #333; padding: 5px; 
          border-radius: 4px; box-shadow: 0 10px 25px rgba(0,0,0,0.8);
        }
        .hp-dropdown-item {
          width: 100%; padding: 12px; background: none; border: none; 
          color: #eee; text-align: left; font-size: 0.75rem; cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
        }
        .hp-dropdown-item:hover { background: #1a1a1a; color: #A2D2FF; }

        /* MAIN CONTENT */
        .hp-main { padding: 100px 1.5rem 2rem; max-width: 1000px; margin: auto; }
        .hp-grid { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }

        /* PROFILE SECTION */
        .hp-profile-hero { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 3rem; }
        .hp-hero-img { width: 90px; height: 90px; border-radius: 4px; object-fit: cover; border: 1px solid #333; background: #111; }
        .hp-hero-text h2 { font-family: 'JetBrains Mono', monospace; font-size: 1.6rem; color: #fff; margin-bottom: 5px; }
        .hp-label { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #A2D2FF; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }

        .hp-card { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 1.5rem; border-radius: 4px; }
        .hp-btn-outline {
          display: block; width: 100%; padding: 12px; background: transparent; 
          border: 1px solid #333; color: #fff; font-weight: 700; font-size: 0.7rem;
          cursor: pointer; font-family: 'JetBrains Mono', monospace; text-align: center;
        }
        .hp-btn-outline:hover { border-color: #A2D2FF; color: #A2D2FF; }

        /* STATS */
        .hp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .hp-stat-box { background: #080808; border: 1px solid #1a1a1a; padding: 1.2rem; border-radius: 4px; text-align: center; }
        .hp-stat-val { font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; color: #fff; }
        .hp-stat-label { font-size: 0.6rem; color: #555; text-transform: uppercase; margin-top: 6px; font-weight: 700; }

        @media (max-width: 800px) { .hp-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="hp-root">
        <nav className="hp-nav">
          <div className="hp-nav-logo">42_TRANSCENDENCE </div>
          
          <div className="hp-nav-links">
            <button className={`hp-nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}>[HOME]</button>
            <button className={`hp-nav-btn ${activeSection === 'messages' ? 'active' : ''}`} onClick={() => setActiveSection('messages')}>[MAIL]</button>
            <button className={`hp-nav-btn ${activeSection === 'groups' ? 'active' : ''}`} onClick={() => setActiveSection('groups')}>[TEAM]</button>
          </div>

          <div className="hp-nav-right" ref={menuRef}>
            <button className="hp-avatar-trigger" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <img src={avatarSrc} style={{ width: '28px', height: '28px', borderRadius: '2px', objectFit: 'cover' }} alt="nav-avatar" />
              <span style={{ color: '#444', fontSize: '0.6rem' }}>▼</span>
            </button>
            
            {userMenuOpen && (
              <div className="hp-dropdown">
                <div style={{ padding: '10px', borderBottom: '1px solid #222', marginBottom: '5px' }}>
                  <div style={{ fontSize: '0.65rem', color: '#555' }}>LOGGED_IN_AS</div>
                  <div style={{ fontSize: '0.75rem', color: '#A2D2FF', fontFamily: 'JetBrains Mono' }}>{user?.username}</div>
                </div>
                <button className="hp-dropdown-item" onClick={() => window.location.href = '/profile'}>VIEW_PROFILE</button>
                <button className="hp-dropdown-item" onClick={handleLogout} style={{ color: '#ff5555' }}>TERMINATE_SESSION</button>
              </div>
            )}
          </div>
        </nav>

        <div className="hp-main">
          {/* Main Identity Info (Cleaned Up) */}
          <div className="hp-profile-hero">
            <img src={avatarSrc} className="hp-hero-img" alt="main-avatar" />
            <div className="hp-hero-text">
              <div className="hp-label">Identity</div>
              <h2>{user?.username}</h2>
              <p style={{ color: '#444', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>
                {user?.email} <span style={{ color: '#222' }}>|</span> NODE_ID: 0{user?.id}
              </p>
            </div>
          </div>

          <div className="hp-grid">
            <aside>
              <div className="hp-card">
                <div className="hp-section">
                  <span className="hp-label">Uplink_Module</span>
                  <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '10px', lineHeight: '1.4' }}>
                    Sync new avatar visualization.
                  </p>
                </div>

                <div className="hp-section">
                  <input type="file" hidden id="hp-upload-file" onChange={handleAvatarUpload} accept="image/*" />
                  <label htmlFor="hp-upload-file" className="hp-btn-outline" style={{ cursor: 'pointer' }}>
                    {uploading ? 'UPLOADING...' : '[CHANGE_AVATAR]'}
                  </label>
                </div>
              </div>
            </aside>

            <main>
              <div className="hp-stats">
                <div className="hp-stat-box">
                  <div className="hp-stat-val">00</div>
                  <div className="hp-stat-label">Inbound</div>
                </div>
                <div className="hp-stat-box">
                  <div className="hp-stat-val">00</div>
                  <div className="hp-stat-label">Clusters</div>
                </div>
                <div className="hp-stat-box">
                  <div className="hp-stat-val" style={{ color: '#A2D2FF' }}>ONLINE</div>
                  <div className="hp-stat-label">Link_Status</div>
                </div>
              </div>

              <div className="hp-card" style={{ borderLeft: '2px solid #A2D2FF' }}>
                <div className="hp-section">
                  <span className="hp-label">System_Console</span>
                  <div style={{ marginTop: '15px', fontFamily: 'JetBrains Mono', fontSize: '0.85rem', color: '#eee', lineHeight: '1.6' }}>
                    &gt; Welcome back, <span style={{ color: '#A2D2FF' }}>{user?.username}</span>.<br/>
                    &gt; Accessing terminal node...<br/>
                    &gt; Connection stable.
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;