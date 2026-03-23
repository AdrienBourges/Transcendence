// src/pages/HomePage.tsx
// src/pages/HomePage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import axios from 'axios';

const HomePage: React.FC = () => {
  const { user, checkAuth } = useAuthStore();

  const [uploading, setUploading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'messages' | 'groups'>('dashboard');

  const menuRef = useRef<HTMLDivElement>(null);

  // 处理点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.reload();
  };

  /**
   * 修复后的头像上传函数
   */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    // 必须与后端 uploadRoutes 中的 .single("avatar") 保持一致
    formData.append('avatar', file); 

    setUploading(true);
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      
      // 路径对应：/api (app.ts) + /upload (index.js) + /avatar (upload.routes.ts)
      await axios.post('http://localhost:3000/api/upload/avatar', formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        },
      });
      
      // 这里的 500ms 延迟是为了确保后端数据库 IO 完成，防止 checkAuth 抓到旧缓存
      setTimeout(async () => {
        await checkAuth(); 
        alert('SUCCESS: Avatar uplink synchronized.');
      }, 500);

    } catch (err: any) {
      console.error("Upload Error:", err);
      const status = err.response?.status;
      alert(`UPLOAD_FAILED: ${status || 'Unknown Error'}. 请确认后端服务已启动。`);
    } finally {
      setUploading(false);
    }
  };

  /**
   * 解决不刷新问题的关键：Cache Busting
   * 在 URL 后面加上时间戳，强制浏览器跳过缓存重新下载图片
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
          position: fixed; top: 0; left: 0; right: 0; height: 50px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.5rem; background: #000; border-bottom: 1px solid #333; z-index: 1000;
        }

        .hp-nav-logo { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.9rem; color: #A2D2FF; }

        .hp-nav-links { display: flex; gap: 0.5rem; }

        .hp-nav-btn {
          background: none; border: none; padding: 0.4rem 0.8rem; font-size: 0.75rem;
          color: #bbb; cursor: pointer; font-family: 'JetBrains Mono', monospace;
        }
        .hp-nav-btn:hover { color: #fff; }
        .hp-nav-btn.active { color: #A2D2FF; background: #111; border-radius: 2px; }

        /* MAIN CONTENT */
        .hp-main { padding: 80px 1.5rem 2rem; max-width: 1000px; margin: auto; }

        .hp-grid { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }

        /* PROFILE HERO */
        .hp-profile-hero { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; }
        .hp-hero-img { width: 80px; height: 80px; border-radius: 4px; object-fit: cover; border: 1px solid #444; }
        
        .hp-hero-text h2 { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; color: #fff; margin-bottom: 4px; }
        .hp-hero-sub { color: #A2D2FF; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; font-weight: 500; }

        /* CARD AND SECTIONS */
        .hp-card { 
          background: #0a0a0a; border: 1px solid #222; padding: 1.5rem; border-radius: 4px; 
          display: flex; flex-direction: column; gap: 1.8rem; 
        }

        .hp-section { display: flex; flex-direction: column; gap: 0.8rem; }

        /* TYPOGRAPHY */
        .hp-label { 
          font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; 
          color: #A2D2FF; 
          text-transform: uppercase; letter-spacing: 1px; font-weight: 700;
        }

        .hp-text-dim { color: #eee; font-size: 0.85rem; line-height: 1.4; } 
        .hp-text-main { color: #fff; font-size: 0.95rem; font-family: 'JetBrains Mono', monospace; }

        /* BUTTONS */
        .hp-btn {
          display: block; width: 100%; padding: 10px; background: #A2D2FF;
          color: #000; border: none; border-radius: 2px; font-weight: 700;
          font-size: 0.75rem; cursor: pointer; font-family: 'JetBrains Mono', monospace;
          text-align: center;
        }

        .hp-btn-outline {
          background: transparent; border: 1px solid #555; color: #fff;
        }
        .hp-btn-outline:hover { border-color: #A2D2FF; color: #A2D2FF; }

        /* STATS */
        .hp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .hp-stat-box { background: #0a0a0a; border: 1px solid #222; padding: 1rem; border-radius: 4px; text-align: center; }
        .hp-stat-val { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; color: #fff; }
        .hp-stat-label { font-size: 0.65rem; color: #aaa; text-transform: uppercase; margin-top: 4px; font-weight: 700; }

        @media (max-width: 800px) { .hp-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="hp-root">
        <nav className="hp-nav">
          <div className="hp-nav-logo">42_TRANSCENDENCE</div>
          <div className="hp-nav-links">
            <button className={`hp-nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}>[HOME]</button>
            <button className={`hp-nav-btn ${activeSection === 'messages' ? 'active' : ''}`} onClick={() => setActiveSection('messages')}>[MAIL]</button>
            <button className={`hp-nav-btn ${activeSection === 'groups' ? 'active' : ''}`} onClick={() => setActiveSection('groups')}>[TEAM]</button>
          </div>
          <div className="hp-nav-right" ref={menuRef}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              {/* 顶栏头像也使用了同样的刷新机制 */}
              <img src={avatarSrc} style={{ width: '32px', height: '32px', borderRadius: '2px', border: '1px solid #555', objectFit: 'cover' }} alt="profile" />
            </button>
            {userMenuOpen && (
              <div style={{ position: 'absolute', top: '45px', right: 0, width: '160px', background: '#111', border: '1px solid #444', padding: '4px', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <button style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#fff', textAlign: 'left', fontSize: '0.8rem', cursor: 'pointer' }} onClick={handleLogout}>LOGOUT_SESSION</button>
              </div>
            )}
          </div>
        </nav>

        <div className="hp-main">
          {/* Identity Header */}
          <div className="hp-profile-hero">
            <img src={avatarSrc} className="hp-hero-img" alt="avatar" />
            <div className="hp-hero-text">
              <div className="hp-label">Subject_Identity</div>
              <h2>{user?.username}</h2>
              <p className="hp-hero-sub">{user?.email} // {user?.authProvider?.toUpperCase()}</p>
            </div>
          </div>

          <div className="hp-grid">
            <aside>
              <div className="hp-card">
                <div className="hp-section">
                  <span className="hp-label">Configuration</span>
                  <p className="hp-text-dim">Update your visual identification on the network.</p>
                </div>

                <div className="hp-section">
                  <span className="hp-label">IMAGE_UPLINK</span>
                  <input type="file" hidden id="avatar-input" onChange={handleAvatarUpload} accept="image/*" />
                  <label htmlFor="avatar-input" className="hp-btn hp-btn-outline" style={{ cursor: 'pointer' }}>
                    {uploading ? 'UPLOADING...' : 'CHANGE_AVATAR'}
                  </label>
                </div>
              </div>
            </aside>

            <main>
              <div className="hp-stats">
                <div className="hp-stat-box">
                  <div className="hp-stat-val">00</div>
                  <div className="hp-stat-label">Inbound_Msg</div>
                </div>
                <div className="hp-stat-box">
                  <div className="hp-stat-val">00</div>
                  <div className="hp-stat-label">Active_Groups</div>
                </div>
                <div className="hp-stat-box">
                  <div className="hp-stat-val" style={{ color: '#A2D2FF' }}>ONLINE</div>
                  <div className="hp-stat-label">System_Link</div>
                </div>
              </div>

              <div className="hp-card">
                <div className="hp-section">
                  <span className="hp-label">System_Log</span>
                  <div className="hp-text-main">Welcome back, {user?.username}.</div>
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