import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';

const HomePage: React.FC = () => {
  const { user } = useAuthStore();

  // --- UI States ---
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'messages' | 'groups'>('dashboard');
  
  // --- Search States ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Friends States ---
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Constants for reusability
  const BACKEND_URL = 'http://localhost:3000';
  const BABY_BLUE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E";

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

  // Fetch friend list from backend: GET /api/users/me/friends
  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const res = await axios.get(`${BACKEND_URL}/api/users/me/friends`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriendsList(res.data);
    } catch (err) {
      console.error("FETCH_FRIENDS_ERROR", err);
    }
  };

  useEffect(() => {
    if (user) fetchFriends();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.href = '/login';
  };

  // Add friend by ID: POST /api/friends/:id
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await axios.post(`${BACKEND_URL}/api/friends/${searchQuery}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`SUCCESS: Node ${searchQuery} linked to your cluster.`);
      setSearchQuery('');
      setIsSearchOpen(false);
      fetchFriends(); 
    } catch (err) {
      console.error("ADD_FRIEND_ERROR", err);
      alert("LINK_FAILED: Unauthorized or Node not found.");
    }
  };

  // Remove friend: DELETE /api/friends/:id
  const handleRemoveFriend = async (friendId: number) => {
    if (!window.confirm("TERMINATE_LINK_WITH_NODE?")) return;
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await axios.delete(`${BACKEND_URL}/api/friends/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFriends();
    } catch (err) {
      alert("DELETION_FAILED");
    }
  };

  // Helper to handle avatar path with fallback
  const getAvatarUrl = (path: string | null | undefined) => {
    if (!path) return BABY_BLUE_SVG;
    return `${BACKEND_URL}${path}`;
  };

  const currentUserAvatar = getAvatarUrl(user?.profile?.avatarUrl);
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050505; color: #ffffff; font-family: 'Inter', sans-serif; overflow-x: hidden; }

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

        /* SEARCH CONTAINER */
        .hp-search-container {
          display: flex; align-items: center; background: #111; border: 1px solid #333;
          border-radius: 4px; padding: 2px 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden; width: ${isSearchOpen ? '220px' : '34px'};
        }
        .hp-search-input {
          background: transparent; border: none; color: #fff; font-family: 'JetBrains Mono';
          font-size: 0.7rem; width: 100%; padding-left: 8px; outline: none;
          opacity: ${isSearchOpen ? 1 : 0};
        }

        /* MAIN CONTENT & STATS */
        .hp-main { padding: 100px 1.5rem 2rem; max-width: 900px; margin: auto; }
        .hp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .hp-stat-box { 
          background: #080808; border: 1px solid #1a1a1a; padding: 1.2rem; 
          border-radius: 4px; text-align: center; transition: border 0.3s;
        }
        .hp-stat-box.clickable:hover { border-color: #A2D2FF; cursor: pointer; }
        .hp-stat-val { font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; color: #fff; }
        .hp-stat-label { font-size: 0.6rem; color: #555; text-transform: uppercase; margin-top: 6px; font-weight: 700; }

        /* FRIENDS MODAL */
        .friends-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(4px);
          z-index: 2000; display: flex; align-items: center; justify-content: center;
        }
        .friends-modal {
          background: #0a0a0a; border: 1px solid #333; width: 360px;
          padding: 1.5rem; border-radius: 4px; position: relative;
        }
        .friend-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px; border-bottom: 1px solid #111;
        }
        .friend-node-info { display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; }
        .friend-avatar { width: 32px; height: 32px; border-radius: 2px; background: #222; border: 1px solid #333; object-fit: cover; }
        .btn-terminate { 
          background: none; border: 1px solid #330000; color: #551111; 
          font-family: 'JetBrains Mono'; font-size: 0.5rem; padding: 2px 5px; cursor: pointer; 
        }
        .btn-terminate:hover { border-color: #ff5555; color: #ff5555; }

        .hp-dropdown {
          position: absolute; top: 45px; right: 0; width: 180px; 
          background: #0a0a0a; border: 1px solid #333; padding: 5px; 
          border-radius: 4px; z-index: 1001;
        }
        .hp-dropdown-item {
          width: 100%; padding: 12px; background: none; border: none; 
          color: #eee; text-align: left; font-size: 0.75rem; cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
        }
        .hp-dropdown-item:hover { background: #1a1a1a; color: #A2D2FF; }
      `}</style>

      <div className="hp-root">
        <nav className="hp-nav">
          <div className="hp-nav-logo">42_TRANSCENDENCE</div>
          
          <div className="hp-nav-links">
            <button className={`hp-nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}>[DASHBOARD]</button>
            <button className={`hp-nav-btn ${activeSection === 'messages' ? 'active' : ''}`} onClick={() => setActiveSection('messages')}>[MAIL]</button>
            <button className={`hp-nav-btn ${activeSection === 'groups' ? 'active' : ''}`} onClick={() => setActiveSection('groups')}>[TEAM]</button>
          </div>

          <div className="hp-nav-right" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div className="hp-search-container" ref={searchRef}>
              <button className="hp-search-btn" onClick={() => setIsSearchOpen(!isSearchOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
              <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
                <input className="hp-search-input" placeholder="INPUT_USER_ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus={isSearchOpen} />
              </form>
            </div>

            <div style={{ position: 'relative' }} ref={menuRef}>
              <button className="hp-avatar-trigger" onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ background: '#111', border: '1px solid #333', cursor: 'pointer', padding: '2px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                  src={currentUserAvatar} 
                  onError={(e) => {(e.target as HTMLImageElement).src = BABY_BLUE_SVG}}
                  style={{ width: '28px', height: '28px', borderRadius: '2px', objectFit: 'cover' }} 
                  alt="nav-avatar" 
                />
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
          {/* Hero Section */}
          <div className="hp-profile-hero" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
            <img 
              src={currentUserAvatar} 
              onError={(e) => {(e.target as HTMLImageElement).src = BABY_BLUE_SVG}}
              style={{ width: '80px', height: '80px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #333' }} 
              alt="main-avatar" 
            />
            <div className="hp-hero-text">
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: '#A2D2FF', textTransform: 'uppercase' }}>Global_Identity</div>
              <h2 style={{ fontFamily: 'JetBrains Mono', fontSize: '1.6rem', color: '#fff' }}>{user?.username}</h2>
              <p style={{ color: '#444', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>{user?.email} | NODE_ID: 0{user?.id}</p>
            </div>
          </div>

          <div className="hp-content">
            <div className="hp-stats">
              <div className="hp-stat-box"><div className="hp-stat-val">00</div><div className="hp-stat-label">Inbound_Msgs</div></div>
              
              <div className="hp-stat-box clickable" onClick={() => setFriendsOpen(true)}>
                <div className="hp-stat-val" style={{ color: '#A2D2FF' }}>{String(friendsList.length).padStart(2, '0')}</div>
                <div className="hp-stat-label">Friend_Nodes</div>
              </div>

              <div className="hp-stat-box"><div className="hp-stat-val" style={{ color: '#A2D2FF' }}>ONLINE</div><div className="hp-stat-label">Status</div></div>
            </div>

            <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '1.5rem', borderRadius: '4px', borderLeft: '2px solid #A2D2FF' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: '#A2D2FF' }}>Terminal_Output</div>
              <div style={{ marginTop: '15px', fontFamily: 'JetBrains Mono', fontSize: '0.85rem', color: '#eee', lineHeight: '1.6' }}>
                &gt; Welcome to the grid, <span style={{ color: '#A2D2FF' }}>{user?.username}</span>.<br/>
                &gt; Searching for nodes? Use the top search bar with USER_ID.<br/>
                &gt; Connection status: <span style={{ color: '#A2D2FF' }}>STABLE</span>.
              </div>
            </div>
          </div>
        </div>

        {/* Friends List Modal */}
        {friendsOpen && (
          <div className="friends-overlay" onClick={() => setFriendsOpen(false)}>
            <div className="friends-modal" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: '#A2D2FF' }}>ESTABLISHED_LINKS</span>
                <span style={{ cursor: 'pointer', color: '#444', fontSize: '0.7rem' }} onClick={() => setFriendsOpen(false)}>[CLOSE]</span>
              </div>
              
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {friendsList.length > 0 ? friendsList.map(f => (
                  <div key={f.id} className="friend-item">
                    <div className="friend-node-info" onClick={() => window.location.href = `/profile/${f.id}`}>
                      {/* Robust Avatar Handling */}
                      <img 
                        className="friend-avatar" 
                        src={getAvatarUrl(f.profile?.avatarUrl)} 
                        onError={(e) => {
                          // Fallback if the path points to a non-existent file (404)
                          (e.target as HTMLImageElement).src = BABY_BLUE_SVG;
                        }}
                        alt="f-avatar" 
                      />
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#eee', fontFamily: 'JetBrains Mono' }}>{f.username}</div>
                        <div style={{ fontSize: '0.6rem', color: '#444' }}>NODE_0{f.id}</div>
                      </div>
                    </div>
                    <button className="btn-terminate" onClick={() => handleRemoveFriend(f.id)}>[TERMINATE]</button>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', color: '#333', fontSize: '0.7rem', padding: '20px' }}>NO_LINKED_NODES_FOUND</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;