import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';
import ChatPage from './ChatPage';

const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  
  const { 
    hasNotification, 
    setNotification, 
    sockets,           
    joinConversations,  
    setActiveConv,      
    disconnectAll 
  } = useChatStore();

  // --- UI States ---
  const [activeSection, setActiveSection] = useState<'dashboard' | 'messages' | 'groups'>('dashboard');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendsOpen, setFriendsOpen] = useState(false);

  // --- Data States ---
  const [conversations, setConversations] = useState<any[]>([]);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL = 'http://localhost:3000';
  const BABY_BLUE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E";

  /**
   * Close dropdown menus/search bar when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setIsSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Sorting logic
   */
  const sortConversations = (list: any[]) => {
    return [...list].sort((a: any, b: any) => {
      const timeA = a.lastMessage?.createdAt ?? a.updatedAt;
      const timeB = b.lastMessage?.createdAt ?? b.updatedAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  };

  /**
   * Fetch friends list
   */
  const fetchFriends = useCallback(async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const res = await axios.get(`${BACKEND_URL}/api/users/me/friends`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriendsList(res.data);
    } catch (err) { console.error("FETCH_FRIENDS_ERROR", err); }
  }, []);

  /**
   * Fetch conversation list (including message completion patch)
   */
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const res = await axios.get(`${BACKEND_URL}/api/conversations?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const cleaned = await Promise.all(res.data.map(async (conv: any) => {
        const participant = conv.ConvParticipants?.find((p: any) => p.user?.id !== user.id) 
                          || conv.ConvParticipants?.[0];
        const otherUser = participant?.user || { username: "Unknown Node", id: 0 };

        let lastMessage = null;
        try {
          const msgRes = await axios.get(`${BACKEND_URL}/api/conversations/${conv.id}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const msgs = msgRes.data;
          lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;
        } catch (e) {}

        return { id: conv.id, otherUser, lastMessage, updatedAt: conv.updatedAt };
      }));

      setConversations(sortConversations(cleaned));
      const allConvIds = cleaned.map((c: any) => c.id);
      if (allConvIds.length > 0) joinConversations(allConvIds);
    } catch (err) { console.error("FETCH_CONVERSATIONS_ERROR", err); }
  }, [user?.id, joinConversations]);

  /**
   * Add friend
   */
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await axios.post(`${BACKEND_URL}/api/friends/${searchQuery}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchQuery('');
      setIsSearchOpen(false);
      fetchFriends();
    } catch (err) { alert("LINK_FAILED: Node not found."); }
  };

  /**
   * Remove friend
   */
  const handleRemoveFriend = async (friendId: number) => {
    if (!window.confirm("TERMINATE_LINK_WITH_NODE?")) return;
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await axios.delete(`${BACKEND_URL}/api/friends/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFriends();
    } catch (err) { alert("DELETION_FAILED"); }
  };

  /**
   * Socket real-time listener
   */
  useEffect(() => {
    if (sockets.size === 0) return;
    const handlers = new Map<number, (msg: any) => void>();
    sockets.forEach((socket, convId) => {
      const handler = (msg: any) => {
        setConversations(prev => {
          const updated = prev.map(conv =>
            conv.id === convId ? { ...conv, lastMessage: { content: msg.content, createdAt: msg.createdAt } } : conv
          );
          return sortConversations(updated);
        });
      };
      socket.on('message:new', handler);
      handlers.set(convId, handler);
    });
    return () => {
      handlers.forEach((handler, convId) => { sockets.get(convId)?.off('message:new', handler); });
    };
  }, [sockets]);

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchFriends();
    }
  }, [user?.id, fetchConversations, fetchFriends]);

  const handleOpenChat = (convId: string) => {
    setActiveChatId(convId);
    setActiveConv(Number(convId));
  };

  const handleCloseChat = () => {
    setActiveChatId(null);
    setActiveConv(null);
  };

  const getAvatarUrl = (path: string | null | undefined) => {
    if (!path) return BABY_BLUE_SVG;
    return `${BACKEND_URL}${path}`;
  };

  const handleLogout = () => {
    disconnectAll();
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.href = '/login';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050505; color: #ffffff; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        
        .hp-nav { position: fixed; top: 0; left: 0; right: 0; height: 55px; display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; background: rgba(0,0,0,0.9); border-bottom: 1px solid #222; z-index: 1000; backdrop-filter: blur(10px); }
        .hp-nav-logo { font-family: 'JetBrains Mono'; font-weight: 700; font-size: 0.85rem; color: #A2D2FF; letter-spacing: 1px; }
        .hp-nav-links { display: flex; gap: 0.5rem; position: absolute; left: 50%; transform: translateX(-50%); }
        .hp-nav-btn { background: none; border: none; padding: 0.4rem 1rem; font-size: 0.7rem; color: #666; cursor: pointer; font-family: 'JetBrains Mono'; transition: 0.2s; position: relative; }
        .hp-nav-btn:hover { color: #fff; }
        .hp-nav-btn.active { color: #A2D2FF; background: #111; border-radius: 2px; }

        /* SEARCH */
        .hp-search-container {
          display: flex; align-items: center; background: #111; border: 1px solid #333;
          border-radius: 4px; padding: 2px 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden; width: ${isSearchOpen ? '200px' : '34px'};
        }
        .hp-search-input {
          background: transparent; border: none; color: #fff; font-family: 'JetBrains Mono';
          font-size: 0.7rem; width: 100%; padding-left: 8px; outline: none;
          opacity: ${isSearchOpen ? 1 : 0};
        }

        .notif-dot { position: absolute; top: 6px; right: 6px; width: 6px; height: 6px; background: #ff4d4d; border-radius: 50%; box-shadow: 0 0 8px #ff4d4d; z-index: 10; }

        .hp-main { padding: 100px 1.5rem 2rem; max-width: 900px; margin: auto; }
        .hp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .hp-stat-box { background: #080808; border: 1px solid #1a1a1a; padding: 1.2rem; border-radius: 4px; text-align: center; transition: 0.2s; }
        .hp-stat-box.clickable:hover { border-color: #A2D2FF; cursor: pointer; }
        .hp-stat-val { font-family: 'JetBrains Mono'; font-size: 1.2rem; color: #fff; }
        .hp-stat-label { font-size: 0.6rem; color: #555; text-transform: uppercase; margin-top: 6px; font-weight: 700; }

        .mail-list { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        .mail-item { background: #080808; border: 1px solid #1a1a1a; padding: 1rem; border-radius: 4px; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: 0.2s; }
        .mail-item:hover { border-color: #A2D2FF; background: #0c0c0c; }
        .mail-avatar { width: 42px; height: 42px; border-radius: 2px; border: 1px solid #333; object-fit: cover; }
        .mail-info { flex: 1; min-width: 0; }
        .mail-user { font-family: 'JetBrains Mono'; font-size: 0.85rem; color: #fff; }
        .mail-preview { font-size: 0.7rem; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }

        /* FRIENDS MODAL */
        .friends-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .friends-modal { background: #0a0a0a; border: 1px solid #333; width: 360px; padding: 1.5rem; border-radius: 4px; position: relative; }
        .friend-item { display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #111; }
        .friend-node-info { display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; }
        .friend-avatar { width: 32px; height: 32px; border-radius: 2px; border: 1px solid #333; object-fit: cover; }
        .btn-terminate { background: none; border: 1px solid #300; color: #511; font-family: 'JetBrains Mono'; font-size: 0.5rem; padding: 2px 5px; cursor: pointer; }
        .btn-terminate:hover { border-color: #f55; color: #f55; }

        .chat-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .chat-window { background: #0a0a0a; border: 1px solid #333; width: 450px; height: 600px; border-radius: 4px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; }
        
        .hp-dropdown { position: absolute; top: 45px; right: 0; width: 180px; background: #0a0a0a; border: 1px solid #333; padding: 5px; border-radius: 4px; z-index: 1001; }
        .hp-dropdown-item { width: 100%; padding: 10px; background: none; border: none; color: #eee; text-align: left; font-size: 0.7rem; cursor: pointer; font-family: 'JetBrains Mono'; }
        .hp-dropdown-item:hover { background: #111; color: #A2D2FF; }

        .hp-label { font-family: 'JetBrains Mono'; font-size: 0.7rem; color: #A2D2FF; text-transform: uppercase; }
      `}</style>

      <div className="hp-root">
        <nav className="hp-nav">
          <div className="hp-nav-logo">42_TRANSCENDENCE</div>
          
          <div className="hp-nav-links">
            <button className={`hp-nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}>[DASHBOARD]</button>
            <button className={`hp-nav-btn ${activeSection === 'messages' ? 'active' : ''}`} onClick={() => setActiveSection('messages')}>
              [MAIL]
              {hasNotification && <div className="notif-dot" />}
            </button>
            <button className={`hp-nav-btn ${activeSection === 'groups' ? 'active' : ''}`} onClick={() => setActiveSection('groups')}>[TEAM]</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {/* Search Bar */}
            <div className="hp-search-container" ref={searchRef}>
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
              <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
                <input className="hp-search-input" placeholder="ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </form>
            </div>

            <div style={{ position: 'relative' }} ref={menuRef}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ background: '#111', border: '1px solid #333', cursor: 'pointer', padding: '2px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={getAvatarUrl(user?.profile?.avatarUrl)} style={{ width: '28px', height: '28px', borderRadius: '2px', objectFit: 'cover' }} alt="nav-avatar" />
                <span style={{ color: '#444', fontSize: '0.6rem' }}>▼</span>
              </button>
              {userMenuOpen && (
                <div className="hp-dropdown">
                  <button className="hp-dropdown-item" onClick={() => window.location.href = '/profile'}>ACCESS_PROFILE</button>
                  <button className="hp-dropdown-item" onClick={handleLogout} style={{ color: '#ff5555' }}>TERMINATE_SESSION</button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="hp-main">
          {activeSection === 'dashboard' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                <img src={getAvatarUrl(user?.profile?.avatarUrl)} style={{ width: '80px', height: '80px', borderRadius: '4px', border: '1px solid #333', objectFit: 'cover' }} alt="hero-avatar" />
                <div>
                  <div className="hp-label">Global_Identity</div>
                  <h2 style={{ fontFamily: 'JetBrains Mono', fontSize: '1.6rem' }}>{user?.username}</h2>
                  <p style={{ color: '#444', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>NODE_ID: 0{user?.id} | STATUS: ONLINE</p>
                </div>
              </div>

              <div className="hp-stats">
                <div className="hp-stat-box">
                  <div className="hp-stat-val">{String(conversations?.length || 0).padStart(2, '0')}</div>
                  <div className="hp-stat-label">Active_Links</div>
                </div>
                {/* RESTORED: Click Friend_Nodes to open friends list */}
                <div className="hp-stat-box clickable" onClick={() => setFriendsOpen(true)}>
                  <div className="hp-stat-val" style={{ color: '#A2D2FF' }}>{String(friendsList?.length || 0).padStart(2, '0')}</div>
                  <div className="hp-stat-label">Friend_Nodes</div>
                </div>
                <div className="hp-stat-box">
                  <div className="hp-stat-val" style={{ color: '#A2D2FF' }}>STABLE</div>
                  <div className="hp-stat-label">Multiplex_Status</div>
                </div>
              </div>

              <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '1.5rem', borderRadius: '4px', borderLeft: '3px solid #A2D2FF' }}>
                <div className="hp-label">Terminal_Output</div>
                <div style={{ marginTop: '10px', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: '#888', lineHeight: '1.6' }}>
                  &gt; Sockets initialized: {sockets.size} active connections.<br/>
                  &gt; Notification logic: Monitoring all private rooms.<br/>
                  &gt; Node status: Ready for inbound packets.
                </div>
              </div>
            </>
          )}

          {activeSection === 'messages' && (
            <div className="hp-mail-section">
              <div className="hp-label">INBOUND_COMMUNICATIONS</div>
              <div className="mail-list">
                {conversations && conversations.length > 0 ? conversations.map(conv => (
                  <div key={conv.id} className="mail-item" onClick={() => handleOpenChat(conv.id.toString())}>
                    <img 
                      src={getAvatarUrl(conv.otherUser.profile?.avatarUrl)} 
                      className="mail-avatar" alt="avatar"
                      onError={(e) => {(e.target as HTMLImageElement).src = BABY_BLUE_SVG}}
                    />
                    <div className="mail-info">
                      <div className="mail-user">{conv.otherUser?.username}</div>
                      <div className="mail-preview">
                        {conv.lastMessage?.content
                          ? (conv.lastMessage.content.length > 30 
                              ? conv.lastMessage.content.slice(0, 30) + '...' 
                              : conv.lastMessage.content)
                          : "CONNECTION_SECURED"}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '100px', color: '#222', fontFamily: 'JetBrains Mono' }}>&gt; NO_DATA_PACKETS</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Friends List Modal */}
        {friendsOpen && (
          <div className="friends-overlay" onClick={() => setFriendsOpen(false)}>
            <div className="friends-modal" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span className="hp-label">ESTABLISHED_LINKS</span>
                <span style={{ cursor: 'pointer', color: '#444', fontSize: '0.7rem' }} onClick={() => setFriendsOpen(false)}>[CLOSE]</span>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {friendsList.length > 0 ? friendsList.map(f => (
                  <div key={f.id} className="friend-item">
                    <div className="friend-node-info" onClick={() => window.location.href = `/profile/${f.id}`}>
                      <img className="friend-avatar" src={getAvatarUrl(f.profile?.avatarUrl)} onError={(e) => {(e.target as HTMLImageElement).src = BABY_BLUE_SVG}} />
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#eee', fontFamily: 'JetBrains Mono' }}>{f.username}</div>
                        <div style={{ fontSize: '0.6rem', color: '#444' }}>NODE_0{f.id}</div>
                      </div>
                    </div>
                    <button className="btn-terminate" onClick={() => handleRemoveFriend(f.id)}>[TERMINATE]</button>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', color: '#333', fontSize: '0.7rem', padding: '20px' }}>NO_LINKED_NODES</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat Overlay */}
        {activeChatId && (
          <div className="chat-overlay" onClick={handleCloseChat}>
            <div className="chat-window" onClick={e => e.stopPropagation()}>
              <ChatPage conversationId={activeChatId} onClose={handleCloseChat} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
