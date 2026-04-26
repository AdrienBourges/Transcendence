import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatPage from './ChatPage';
import GroupsPage from './GroupsPage';
import TeammateFinderPage from './TeammateFinderPage';

const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    hasNotification,
    setNotification,
    sockets,
    joinConversations,
    setActiveConv,
    disconnectAll
  } = useChatStore();

  // --- UI States ---
  const [activeSection, setActiveSection] = useState<'dashboard' | 'messages' | 'groups' | 'finder'>('dashboard');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);

  // --- Data States ---
  const [conversations, setConversations] = useState<any[]>([]);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const [unreadInvites, setUnreadInvites] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL = '';
  const BABY_BLUE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E";

  /**
   * Notification retrieval logic
   */
  const fetchAllNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (activeSection === 'groups') {
        setUnreadInvites(0);
        return;
      }

      let totalNotifications = 0;

      // 1. Retrieve the received invitation
      const receivedRes = await axios.get(`${BACKEND_URL}/api/groups/invitations/received`, config);
      const receivedData = Array.isArray(receivedRes.data) ? receivedRes.data : [];
      totalNotifications += receivedData.filter((inv: any) =>
        inv.status === 'PENDING' || inv.status === 'pending'
      ).length;

      // 2. Obtain pending invitations as the group leader.
      const myGroupsRes = await axios.get(`${BACKEND_URL}/api/groups/me`, config);
      const myGroups = Array.isArray(myGroupsRes.data) ? myGroupsRes.data : [];

      const ownerNotifications = await Promise.all(myGroups.map(async (group: any) => {
        if (!group?.id) return 0;
        try {
          const invRes = await axios.get(`${BACKEND_URL}/api/groups/${group.id}/invitations`, config);
          const invitations = Array.isArray(invRes.data) ? invRes.data : [];
          return invitations.filter((i: any) => i.status === 'PENDING' || i.status === 'pending').length;
        } catch (e) {
          return 0;
        }
      }));

      const totalOwnerPending = ownerNotifications.reduce((a, b) => a + b, 0);
      setUnreadInvites(totalNotifications + totalOwnerPending);

    } catch (err) {
      console.error("NOTIFICATION_FETCH_ERROR_LOG:", err);
    }
  }, [user?.id, activeSection]);

  /**
   * Switching Section Logic
   */
  const handleSwitchSection = (section: 'dashboard' | 'messages' | 'groups' | 'finder') => {
    setActiveSection(section);
    if (section === 'groups') {
      setUnreadInvites(0);
    }
  };

  /**
   * Synchronize URL parameters
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section === 'groups') handleSwitchSection('groups');
    if (section === 'finder') handleSwitchSection('finder');
    if (section === 'messages') handleSwitchSection('messages');
    if (section === 'dashboard') handleSwitchSection('dashboard');
  }, [location.search]);

  /**
   * Click the external close menu
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
   * Sort dialog list
   */
  const sortConversations = (list: any[]) => {
    return [...list].sort((a: any, b: any) => {
      const timeA = a.lastMessage?.createdAt ?? a.updatedAt;
      const timeB = b.lastMessage?.createdAt ?? b.updatedAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  };

  /**
   * Get friends list
   */
  const fetchFriends = useCallback(async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const res = await axios.get(`${BACKEND_URL}/api/users/me/friends`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriendsList(res.data);
    } catch (err) {
      console.error("FETCH_FRIENDS_ERROR", err);
    }
  }, []);

  /**
   * Get the chat list and the last message
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

      const sorted = sortConversations(cleaned);
      setConversations(sorted);

      const allConvIds = sorted.map((c: any) => c.id);
      if (allConvIds.length > 0) joinConversations(allConvIds);
    } catch (err) {
      console.error("FETCH_CONVERSATIONS_ERROR", err);
    }
  }, [user?.id, joinConversations]);

  /**
   * Handling search submission (Logic B: Navigate to search page)
   */
  const handleMainSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  /**
   * Handling delete friends
   */
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

  /**
   * search listening
   */
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (isSearchOpen && searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const token = localStorage.getItem(AUTH_TOKEN_KEY);
          const res = await axios.get(`${BACKEND_URL}/api/users/search?username=${searchQuery}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSearchResults(res.data);
        } catch (err) {
          console.error("SEARCH_ERROR", err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isSearchOpen]);

  /**
   * Socket listening
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
      handlers.forEach((handler, convId) => {
        sockets.get(convId)?.off('message:new', handler);
      });
    };
  }, [sockets]);

  /**
   * Initialization and Polling
   */
  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchFriends();
      fetchAllNotifications();
    }
  }, [user?.id, fetchConversations, fetchFriends, fetchAllNotifications]);

  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      fetchConversations();
      fetchAllNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, [user?.id, activeSection, fetchConversations, fetchAllNotifications]);

  const handleOpenChat = (conv: any) => {
    setActiveChatId(conv.id.toString());
    setActiveConv(conv.id);
    setActiveChatUser(conv.otherUser);
    setNotification(false);
  };

  const handleCloseChat = () => {
    setActiveChatId(null);
    setActiveConv(null);
    setActiveChatUser(null);
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

        body {
          background: #050505;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .hp-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          background: rgba(0,0,0,0.9);
          border-bottom: 1px solid #222;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .hp-nav-logo {
          font-family: 'JetBrains Mono';
          font-weight: 700;
          font-size: 0.85rem;
          color: #A2D2FF;
          letter-spacing: 1px;
        }

        .hp-nav-links {
          display: flex;
          gap: 0.5rem;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .hp-nav-btn {
          background: none;
          border: none;
          padding: 0.4rem 1rem;
          font-size: 0.7rem;
          color: #666;
          cursor: pointer;
          font-family: 'JetBrains Mono';
          transition: 0.2s;
          position: relative;
          text-transform: uppercase;
        }

        .hp-nav-btn:hover { color: #fff; }
        .hp-nav-btn.active { color: #A2D2FF; background: #111; border-radius: 2px; }

        .hp-nav-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: #A2D2FF;
          box-shadow: 0 0 10px #A2D2FF;
        }

        .hp-search-container {
          display: flex;
          align-items: center;
          background: #111;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 2px 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          width: ${isSearchOpen ? '200px' : '34px'};
          cursor: pointer;
        }

        .hp-search-input {
          background: transparent;
          border: none;
          color: #fff;
          font-family: 'JetBrains Mono';
          font-size: 0.7rem;
          width: 100%;
          padding-left: 8px;
          outline: none;
          opacity: ${isSearchOpen ? 1 : 0};
          transition: opacity 0.3s;
          pointer-events: ${isSearchOpen ? 'auto' : 'none'};
        }

        .notif-dot {
          position: absolute;
          top: 6px; right: 6px;
          width: 6px; height: 6px;
          background: #ff4d4d;
          border-radius: 50%;
          box-shadow: 0 0 8px #ff4d4d;
          z-index: 10;
        }

        .hp-main {
          padding: 100px 1.5rem 2rem;
          max-width: 900px;
          margin: auto;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hp-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .hp-stat-box {
          background: #080808;
          border: 1px solid #1a1a1a;
          padding: 1.2rem;
          border-radius: 4px;
          text-align: center;
          transition: 0.3s;
        }

        .hp-stat-box.clickable { cursor: pointer; }
        .hp-stat-box.clickable:hover {
          border-color: #A2D2FF;
          background: #0c0c0c;
          transform: translateY(-2px);
        }

        .hp-stat-val {
          font-family: 'JetBrains Mono';
          font-size: 1.2rem;
          color: #fff;
        }

        .hp-stat-label {
          font-size: 0.6rem;
          color: #555;
          text-transform: uppercase;
          margin-top: 6px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .mail-list { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }

        .mail-item {
          background: #080808;
          border: 1px solid #1a1a1a;
          padding: 1rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: 0.2s;
        }

        .mail-item:hover {
          border-color: #A2D2FF;
          background: #0d0d0d;
        }

        .mail-avatar {
          width: 42px; height: 42px;
          border-radius: 2px;
          border: 1px solid #333;
          object-fit: cover;
        }

        .mail-user {
          font-family: 'JetBrains Mono';
          font-size: 0.85rem;
          color: #fff;
        }

        .mail-preview {
          font-size: 0.7rem;
          color: #555;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        .friends-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex; align-items: center; justify-content: center;
        }

        .friends-modal {
          background: #0a0a0a;
          border: 1px solid #333;
          width: 360px;
          padding: 1.5rem;
          border-radius: 4px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .friend-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 10px;
          border-bottom: 1px solid #111;
          transition: 0.2s;
        }

        .friend-item:hover { background: #0d0d0d; }

        .chat-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.85);
          z-index: 2000;
          display: flex; align-items: center; justify-content: center;
        }

        .chat-window {
          background: #0a0a0a;
          border: 1px solid #333;
          width: 450px;
          height: 600px;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(0,0,0,0.7);
        }

        .hp-dropdown {
          position: absolute;
          top: 45px; right: 0;
          width: 180px;
          background: #0a0a0a;
          border: 1px solid #333;
          padding: 5px;
          border-radius: 4px;
          z-index: 1001;
          box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        }

        .hp-dropdown-item {
          width: 100%;
          padding: 10px;
          background: none;
          border: none;
          color: #eee;
          text-align: left;
          font-size: 0.7rem;
          cursor: pointer;
          font-family: 'JetBrains Mono';
          transition: 0.2s;
        }

        .hp-dropdown-item:hover { color: #A2D2FF; background: #111; }

        .hp-label {
          font-family: 'JetBrains Mono';
          font-size: 0.7rem;
          color: #A2D2FF;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .hp-terminal-output {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          padding: 1.5rem;
          border-radius: 4px;
          border-left: 3px solid #A2D2FF;
          margin-top: 1rem;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #A2D2FF; }
      `}</style>

      <div className="hp-root">
        <nav className="hp-nav">
          <div className="hp-nav-logo">42_TRANSCENDENCE</div>

          <div className="hp-nav-links">
            <button className={`hp-nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => handleSwitchSection('dashboard')}>[DASHBOARD]</button>
            <button className={`hp-nav-btn ${activeSection === 'messages' ? 'active' : ''}`} onClick={() => handleSwitchSection('messages')}>
              [MAIL]
              {hasNotification && <div className="notif-dot" />}
            </button>
            <button className={`hp-nav-btn ${activeSection === 'groups' ? 'active' : ''}`} onClick={() => handleSwitchSection('groups')}>
              [TEAM]
              {unreadInvites > 0 && <div className="notif-dot" />}
            </button>
            <button className={`hp-nav-btn ${activeSection === 'finder' ? 'active' : ''}`} onClick={() => handleSwitchSection('finder')}>
              [START_PROJECTS]
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div className="hp-search-container" ref={searchRef} style={{ position: 'relative' }}>
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>

              <form onSubmit={handleMainSearchSubmit} style={{ flex: 1 }}>
                <input
                  className="hp-search-input"
                  placeholder="SEARCH_USER..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus={isSearchOpen}
                />
              </form>

              {/* --- search result display --- */}
              {isSearchOpen && (searchQuery.length > 0 || isSearching) && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '250px',
                  background: '#0a0a0a',
                  border: '1px solid #A2D2FF',
                  borderRadius: '4px',
                  zIndex: 9999,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  boxShadow: '0 0 15px rgba(162, 210, 255, 0.2)'
                }}>
                  {isSearching && (
                    <div style={{ padding: '10px', fontSize: '0.6rem', color: '#A2D2FF', fontFamily: 'JetBrains Mono' }}>
                      [SCANNING_NETWORK...]
                    </div>
                  )}

                  {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                    <div style={{ padding: '10px', fontSize: '0.6rem', color: '#444' }}>NO_NODES_FOUND</div>
                  )}

                  {searchResults.map((result: any) => (
                    <div
                      key={result.id}
                      className="search-result-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #111'
                      }}
                      onClick={() => {
                        window.location.href = `/profile/${result.id}`;
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <img src={getAvatarUrl(result.profile?.avatarUrl)} style={{ width: '24px', height: '24px', borderRadius: '2px', objectFit: 'cover' }} alt="avatar" />
                      <div style={{ fontSize: '0.75rem', color: '#fff', fontFamily: 'JetBrains Mono' }}>{result.username}</div>
                    </div>
                  ))}
                </div>
              )}
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
                <div className="hp-stat-box clickable" onClick={() => setFriendsOpen(true)}>
                  <div className="hp-stat-val" style={{ color: '#A2D2FF' }}>{String(friendsList?.length || 0).padStart(2, '0')}</div>
                  <div className="hp-stat-label">Friend_Nodes</div>
                </div>
                <div className="hp-stat-box clickable" onClick={() => handleSwitchSection('finder')} style={{ borderBottom: '2px solid #ffd700' }}>
                  <div className="hp-stat-val" style={{ color: '#ffd700' }}>SEARCH</div>
                  <div className="hp-stat-label">Find_Teammates</div>
                </div>
              </div>

              <div className="hp-terminal-output">
                <div className="hp-label">Terminal_Output</div>
                <div style={{ marginTop: '10px', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: '#888', lineHeight: '1.6' }}>
                  &gt; Sockets initialized: {sockets.size} active connections.<br/>
                  &gt; Notification logic: Monitoring private rooms and cluster invites.<br/>
                  &gt; System status: Uplink established on 256-bit secure tunnel.<br/>
                  &gt; Last sync: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </>
          )}

          {activeSection === 'messages' && (
            <div className="hp-mail-section">
              <div className="hp-label">INBOUND_COMMUNICATIONS</div>
              <div className="mail-list">
                {conversations.length > 0 ? conversations.map(conv => (
                  <div key={conv.id} className="mail-item" onClick={() => handleOpenChat(conv)}>
                    <img src={getAvatarUrl(conv.otherUser.profile?.avatarUrl)} className="mail-avatar" alt="avatar" onError={(e) => {(e.target as HTMLImageElement).src = BABY_BLUE_SVG}} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mail-user">{conv.otherUser?.username}</div>
                      <div className="mail-preview">{conv.lastMessage?.content || "CONNECTION_SECURED: Waiting for payload..."}</div>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '100px', color: '#222', fontFamily: 'JetBrains Mono' }}>&gt; NO_DATA_PACKETS_IN_BUFFER</div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'groups' && (
            <div className="hp-groups-section">
              <div className="hp-label" style={{ marginBottom: '20px' }}>NETWORK_CLUSTERS</div>
              <GroupsPage />
            </div>
          )}

          {activeSection === 'finder' && (
            <div className="hp-finder-section">
              <div className="hp-label" style={{ marginBottom: '20px' }}>NODE_BROADCAST_RECEIVER</div>
              <TeammateFinderPage />
            </div>
          )}
        </div>

        {/* Friend list overlay */}
        {friendsOpen && (
          <div className="friends-overlay" onClick={() => setFriendsOpen(false)}>
            <div className="friends-modal" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span className="hp-label">ESTABLISHED_LINKS</span>
                <span style={{ cursor: 'pointer', color: '#444', fontSize: '0.7rem' }} onClick={() => setFriendsOpen(false)}>[CLOSE]</span>
              </div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {friendsList.length > 0 ? friendsList.map(f => (
                  <div key={f.id} className="friend-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer' }} onClick={() => window.location.href = `/profile/${f.id}`}>
                      <img className="mail-avatar" style={{ width: '32px', height: '32px' }} src={getAvatarUrl(f.profile?.avatarUrl)} onError={(e) => {(e.target as HTMLImageElement).src = BABY_BLUE_SVG}} alt="avatar" />
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#eee', fontFamily: 'JetBrains Mono' }}>{f.username}</div>
                        <div style={{ fontSize: '0.6rem', color: '#444' }}>NODE_0{f.id}</div>
                      </div>
                    </div>
                    <button className="btn-terminate" style={{ background: 'none', border: '1px solid #300', color: '#511', fontSize: '0.5rem', padding: '2px 5px', cursor: 'pointer' }} onClick={() => handleRemoveFriend(f.id)}>[TERMINATE]</button>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', color: '#333', fontSize: '0.7rem', padding: '20px' }}>NO_LINKED_NODES_FOUND</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat window overlay */}
        {activeChatId && (
          <div className="chat-overlay" onClick={handleCloseChat}>
            <div className="chat-window" onClick={e => e.stopPropagation()}>
              <ChatPage conversationId={activeChatId} onClose={handleCloseChat} otherUser={activeChatUser} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
