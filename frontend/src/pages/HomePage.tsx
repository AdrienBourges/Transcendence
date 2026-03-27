import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';

const HomePage: React.FC = () => {
  const { user, checkAuth } = useAuthStore();

  // --- UI States ---
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'messages' | 'groups'>('dashboard');
  
  // --- New Search States ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.href = '/login';
  };

  // Triggered when user presses Enter in search box
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("INITIATING_GLOBAL_SEARCH:", searchQuery);
    // Backend implementation pending...
  };

  const avatarSrc = user?.profile?.avatarUrl 
    ? `http://localhost:3000${user.profile.avatarUrl}?t=${Date.now()}` 
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E";
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050505; color: #ffffff; font-family: 'Inter', sans-serif; }

        /* NAVBAR */
        .hp-nav {
          position: fixed; top: 0; left: 0; right: 0; height: 55px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.5rem; background: rgba(0,0,0,0.9); border-bottom: 1px solid #222; z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .hp-nav-logo { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.85rem; color: #A2D2FF; letter-spacing: 1px; }

        .hp-nav-links { display: flex; gap: 0.5rem; position: absolute; left: 50%; transform: translateX(-50%); }
        .hp-nav-btn {
          background: none; border: none; padding: 0.4rem 1rem; font-size: 0.7rem;
          color: #666; cursor: pointer; font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s;
        }
        .hp-nav-btn:hover { color: #fff; }
        .hp-nav-btn.active { color: #A2D2FF; background: #111; border-radius: 2px; }

        .hp-nav-right { display: flex; align-items: center; gap: 0.8rem; }
        
        /* --- SEARCH BOX STYLES --- */
        .hp-search-container {
          display: flex; align-items: center; background: #111; border: 1px solid #333;
          border-radius: 4px; padding: 2px 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden; width: ${isSearchOpen ? '220px' : '34px'};
        }
        .hp-search-container:focus-within { border-color: #A2D2FF; box-shadow: 0 0 10px rgba(162, 210, 255, 0.1); }

        .hp-search-input {
          background: transparent; border: none; color: #fff; font-family: 'JetBrains Mono';
          font-size: 0.7rem; width: 100%; padding-left: 8px; outline: none;
          opacity: ${isSearchOpen ? 1 : 0}; transition: opacity 0.2s;
        }

        .hp-search-btn {
          background: none; border: none; color: #666; cursor: pointer;
          display: flex; align-items: center; min-width: 18px; transition: color 0.2s;
        }
        .hp-search-btn:hover { color: #A2D2FF; }

        /* AVATAR & DROPDOWN */
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
        .hp-main { padding: 100px 1.5rem 2rem; max-width: 900px; margin: auto; }
        .hp-profile-hero { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 3rem; }
        .hp-hero-img { width: 80px; height: 80px; border-radius: 4px; object-fit: cover; border: 1px solid #333; background: #111; }
        .hp-hero-text h2 { font-family: 'JetBrains Mono', monospace; font-size: 1.6rem; color: #fff; margin-bottom: 5px; }
        .hp-label { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #A2D2FF; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }

        .hp-card { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 1.5rem; border-radius: 4px; }
        .hp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .hp-stat-box { background: #080808; border: 1px solid #1a1a1a; padding: 1.2rem; border-radius: 4px; text-align: center; }
        .hp-stat-val { font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; color: #fff; }
        .hp-stat-label { font-size: 0.6rem; color: #555; text-transform: uppercase; margin-top: 6px; font-weight: 700; }
      `}</style>

      <div className="hp-root">
        <nav className="hp-nav">
          <div className="hp-nav-logo">42_TRANSCENDENCE</div>
          
          <div className="hp-nav-links">
            <button className={`hp-nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}>[DASHBOARD]</button>
            <button className={`hp-nav-btn ${activeSection === 'messages' ? 'active' : ''}`} onClick={() => setActiveSection('messages')}>[MAIL]</button>
            <button className={`hp-nav-btn ${activeSection === 'groups' ? 'active' : ''}`} onClick={() => setActiveSection('groups')}>[TEAM]</button>
          </div>

          <div className="hp-nav-right">
            {/* --- Animated Search Bar --- */}
            <div className="hp-search-container" ref={searchRef}>
              <button 
                className="hp-search-btn" 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
                <input 
                  className="hp-search-input"
                  placeholder="SEARCH_USER..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus={isSearchOpen}
                />
              </form>
            </div>

            <div style={{ position: 'relative' }} ref={menuRef}>
              <button className="hp-avatar-trigger" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <img src={avatarSrc} style={{ width: '28px', height: '28px', borderRadius: '2px', objectFit: 'cover' }} alt="nav-avatar" />
                <span style={{ color: '#444', fontSize: '0.6rem' }}>▼</span>
              </button>
              
              {userMenuOpen && (
                <div className="hp-dropdown">
                  <div style={{ padding: '10px', borderBottom: '1px solid #222', marginBottom: '5px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#555' }}>SESSION_ID</div>
                    <div style={{ fontSize: '0.75rem', color: '#A2D2FF', fontFamily: 'JetBrains Mono' }}>{user?.username}</div>
                  </div>
                  <button className="hp-dropdown-item" onClick={() => window.location.href = '/profile'}>ACCESS_PROFILE</button>
                  <button className="hp-dropdown-item" onClick={handleLogout} style={{ color: '#ff5555' }}>TERMINATE_SESSION</button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="hp-main">
          {/* Identity Info */}
          <div className="hp-profile-hero">
            <img src={avatarSrc} className="hp-hero-img" alt="main-avatar" />
            <div className="hp-hero-text">
              <div className="hp-label">Global_Identity</div>
              <h2>{user?.username}</h2>
              <p style={{ color: '#444', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>
                {user?.email} <span style={{ color: '#222' }}>|</span> NODE_ID: 0{user?.id}
              </p>
            </div>
          </div>

          <div className="hp-content">
            <div className="hp-stats">
              <div className="hp-stat-box"><div className="hp-stat-val">00</div><div className="hp-stat-label">Inbound_Msgs</div></div>
              <div className="hp-stat-box"><div className="hp-stat-val">00</div><div className="hp-stat-label">Location</div></div>
              <div className="hp-stat-box"><div className="hp-stat-val" style={{ color: '#A2D2FF' }}>ONLINE</div><div className="hp-stat-label">Status</div></div>
            </div>

            <div className="hp-card" style={{ borderLeft: '2px solid #A2D2FF' }}>
              <div className="hp-section">
                <span className="hp-label">Terminal_Output</span>
                <div style={{ marginTop: '15px', fontFamily: 'JetBrains Mono', fontSize: '0.85rem', color: '#eee', lineHeight: '1.6' }}>
                  &gt; Welcome to the grid, <span style={{ color: '#A2D2FF' }}>{user?.username}</span>.<br/>
                  &gt; Global search protocol enabled. Enter user ID to locate your new friend.<br/>
                  &gt; Status: <span style={{ color: '#A2D2FF' }}>LISTENING</span>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;