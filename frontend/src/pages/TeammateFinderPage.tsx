import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import { useAuthStore } from '@/store/useAuthStore'; // Import AuthStore to identify the current user

// --- Types ---
interface ProjectRegistration {
  id: number;
  projectName: string;
  deadline?: string;
  isBonus: boolean;
  description?: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    profile?: {
      avatarUrl?: string;
    };
  };
}

const TeammateFinderPage: React.FC = () => {
  const { user } = useAuthStore(); // Get current logged-in user information
  
  // --- States ---
  const [registrations, setRegistrations] = useState<ProjectRegistration[]>([]);
  const [filterProject, setFilterProject] = useState('MINISHELL');
  const [isBonusFilter, setIsBonusFilter] = useState<string>('all');
  
  // Create Registration Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    projectName: 'MINISHELL',
    description: '',
    isBonus: false,
    deadline: ''
  });

  const BACKEND_URL = 'http://localhost:3000/api';
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- API Calls ---

  // Fetch the list of users who are looking for teammates
  const fetchRegistrations = async () => {
    try {
      let url = `${BACKEND_URL}/project-registrations/search?projectName=${filterProject}`;
      if (isBonusFilter === 'true') url += '&isBonus=true';
      if (isBonusFilter === 'false') url += '&isBonus=false';

      const res = await axios.get(url, config);
      setRegistrations(res.data);
    } catch (err) {
      console.error("FETCH_REGISTRATIONS_ERROR", err);
    }
  };

  // Publish your own request
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/project-registrations`, formData, config);
      setShowCreateModal(false);
      fetchRegistrations(); // Refresh the list
    } catch (err) {
      alert("PUBLISH_FAILED: You might already have a registration for this project.");
    }
  };

  // Delete your own request
  const handleDelete = async (regId: number) => {
    if (!window.confirm("TERMINATE_BROADCAST: Are you sure you want to remove this node signal?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/project-registrations/${regId}`, config);
      fetchRegistrations();
    } catch (err) {
      console.error("DELETE_ERROR", err);
      alert("TERMINATION_FAILED: Internal link error.");
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [filterProject, isBonusFilter]);

  return (
    <div className="finder-container">
      <style>{`
        .finder-container { padding: 40px 20px; max-width: 1100px; margin: 0 auto; font-family: 'JetBrains Mono', monospace; color: #eee; }
        .finder-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; border-bottom: 1px solid #222; padding-bottom: 20px; }
        .control-bar { display: flex; gap: 20px; margin-bottom: 30px; background: #0a0a0a; padding: 20px; border: 1px solid #1a1a1a; }
        .cyber-select { background: #000; border: 1px solid #333; color: #A2D2FF; padding: 8px; font-family: inherit; font-size: 0.8rem; }
        
        .registration-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .reg-card { background: #080808; border: 1px solid #1a1a1a; padding: 20px; border-radius: 4px; position: relative; transition: 0.3s; }
        .reg-card:hover { border-color: #A2D2FF; box-shadow: 0 0 15px rgba(162, 210, 255, 0.1); }
        
        /* Special styling for my own posts  */
        .my-reg-card { border-left: 3px solid #A2D2FF !important; background: #0c0c0c; }
        .my-badge { position: absolute; top: 10px; left: 10px; font-size: 0.55rem; color: #A2D2FF; letter-spacing: 1px; }

        .bonus-badge { position: absolute; top: 10px; right: 10px; font-size: 0.6rem; color: #ffd700; border: 1px solid #ffd700; padding: 2px 5px; }
        
        .user-info { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
        .user-avatar { width: 45px; height: 45px; border-radius: 2px; border: 1px solid #333; }
        .username { font-weight: bold; color: #fff; font-size: 0.9rem; }
        .description { font-size: 0.75rem; color: #888; line-height: 1.5; min-height: 45px; margin-bottom: 15px; }
        
        .btn-prime { background: #A2D2FF; color: #000; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; font-size: 0.75rem; }
        .btn-outline { background: transparent; border: 1px solid #444; color: #fff; padding: 8px 15px; cursor: pointer; font-size: 0.7rem; }
        .btn-outline:hover { border-color: #A2D2FF; color: #A2D2FF; }

        .btn-delete { background: rgba(255, 77, 77, 0.1); border: 1px solid #ff4d4d; color: #ff4d4d; padding: 8px 15px; cursor: pointer; font-size: 0.7rem; transition: 0.2s; font-family: inherit; }
        .btn-delete:hover { background: #ff4d4d; color: #000; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 3000; }
        .modal-content { background: #050505; border: 1px solid #333; padding: 30px; width: 400px; }
        .input-group { margin-bottom: 15px; }
        .input-group label { display: block; font-size: 0.6rem; color: #444; margin-bottom: 5px; }
        .cyber-input { width: 100%; background: #000; border: 1px solid #222; color: #fff; padding: 10px; font-family: inherit; box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div className="finder-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', letterSpacing: '-1px' }}>NODE_DISCOVERY</h1>
          <p style={{ color: '#444', fontSize: '0.7rem' }}>FIND_COMPATIBLE_UNITS_FOR_COLLABORATION</p>
        </div>
        <button className="btn-prime" onClick={() => setShowCreateModal(true)}>+ BROADCAST_REQUEST</button>
      </div>

      {/* Filters */}
      <div className="control-bar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ fontSize: '0.6rem', color: '#444' }}>FILTER_PROJECT</span>
          <select className="cyber-select" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
            <option value="MINISHELL">MINISHELL</option>
            <option value="CUB3D">CUB3D</option>
            <option value="MINIRT">MINIRT</option>
            <option value="WEBSERV">WEBSERV</option>
            <option value="IRC">IRC</option>
            <option value="FT_TRANSCENDENCE">FT_TRANSCENDENCE</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ fontSize: '0.6rem', color: '#444' }}>BONUS_TRACK</span>
          <select className="cyber-select" value={isBonusFilter} onChange={e => setIsBonusFilter(e.target.value)}>
            <option value="all">ALL_MODES</option>
            <option value="true">BONUS_ONLY</option>
            <option value="false">MANDATORY_ONLY</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="registration-grid">
        {registrations.length > 0 ? registrations.map(reg => {
          const isMine = reg.user.id === user?.id;
          
          return (
            <div key={reg.id} className={`reg-card ${isMine ? 'my-reg-card' : ''}`}>
              {isMine && <span className="my-badge">[MY_BROADCAST]</span>}
              {reg.isBonus && <span className="bonus-badge">★ BONUS</span>}
              
              <div className="user-info" style={{ marginTop: isMine ? '10px' : '0' }}>
                <img 
                  src={reg.user.profile?.avatarUrl ? `http://localhost:3000${reg.user.profile.avatarUrl}` : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E"} 
                  className="user-avatar" 
                  alt="avatar" 
                />
                <div>
                  <div className="username">{reg.user.username} {isMine && "(YOU)"}</div>
                  <div style={{ fontSize: '0.6rem', color: '#444' }}>POSTED: {new Date(reg.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <p className="description">
                {reg.description || "NO_ADDITIONAL_INTEL_PROVIDED..."}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: '#A2D2FF' }}>
                  {reg.deadline ? `DEADLINE: ${new Date(reg.deadline).toLocaleDateString()}` : "NO_DEADLINE"}
                </div>
                
                {isMine ? (
                  <button className="btn-delete" onClick={() => handleDelete(reg.id)}>
                    TERMINATE
                  </button>
                ) : (
                  <button className="btn-outline" onClick={() => window.location.href = `/profile/${reg.user.id}`}>
                    VIEW_NODE
                  </button>
                )}
              </div>
            </div>
          );
        }) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#222' }}>
            &gt; NO_DATA_PACKETS_MATCHING_CRITERIA
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1rem', color: '#A2D2FF', marginBottom: '20px' }}>_INIT_BROADCAST</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="input-group">
                <label>TARGET_PROJECT</label>
                <select className="cyber-input" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})}>
                  <option value="MINISHELL">MINISHELL</option>
                  <option value="CUB3D">CUB3D</option>
                  <option value="MINIRT">MINIRT</option>
                  <option value="WEBSERV">WEBSERV</option>
                  <option value="IRC">IRC</option>
                  <option value="FT_TRANSCENDENCE">FT_TRANSCENDENCE</option>
                </select>
              </div>

              <div className="input-group">
                <label>INTEL_DESCRIPTION (GOALS/SKILLS)</label>
                <textarea 
                  className="cyber-input" 
                  rows={4} 
                  placeholder="Tell potential teammates about your plan..."
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>EXPECTED_DEADLINE</label>
                <input 
                  type="date" 
                  className="cyber-input" 
                  onChange={e => setFormData({...formData, deadline: e.target.value})}
                />
              </div>

              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="modal-bonus" onChange={e => setFormData({...formData, isBonus: e.target.checked})} />
                <label htmlFor="modal-bonus" style={{ margin: 0 }}>ENABLE_BONUS_OBJECTIVES</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-prime" style={{ flex: 1 }}>EXECUTE_POST</button>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>ABORT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeammateFinderPage;