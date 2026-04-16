import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import { useAuthStore } from '@/store/useAuthStore';

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
  const { user } = useAuthStore();
  
  // --- Filter states (what the user has selected but not yet applied) ---
  const [filterProject, setFilterProject] = useState('MINISHELL');
  const [isBonusFilter, setIsBonusFilter] = useState<string>('all');
  const [filterDeadline, setFilterDeadline] = useState<string>('');

  // --- Applied filter states (what was last searched) ---
  const [appliedProject, setAppliedProject] = useState('MINISHELL');
  const [appliedBonus, setAppliedBonus] = useState<string>('all');
  const [appliedDeadline, setAppliedDeadline] = useState<string>('');

  const [registrations, setRegistrations] = useState<ProjectRegistration[]>([]);
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

  /**
   * Safe date formatter — returns YYYY-MM-DD or empty string
   */
  const formatDate = (dateInput: string | undefined) => {
    if (!dateInput) return "";
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  /**
   * Fetch registrations using the APPLIED filters (not the pending ones)
   */
  const fetchRegistrations = async (project: string, bonus: string, deadline: string) => {
    try {
      let url = `${BACKEND_URL}/project-registrations/search?projectName=${project}`;
      if (bonus === 'true') url += '&isBonus=true';
      if (bonus === 'false') url += '&isBonus=false';
      
      if (deadline) url += `&maxDeadline=${deadline}`; 
      
      const res = await axios.get(url, config);
      setRegistrations(res.data);
    } catch (err) {
      console.error("FETCH_REGISTRATIONS_ERROR", err);
    }
  };

  /**
   * Apply filters and trigger search
   */
  const handleSearch = () => {
    setAppliedProject(filterProject);
    setAppliedBonus(isBonusFilter);
    setAppliedDeadline(filterDeadline);
    fetchRegistrations(filterProject, isBonusFilter, filterDeadline);
  };

  /**
   * Reset all filters to default and re-fetch
   */
  const handleReset = () => {
    setFilterProject('MINISHELL');
    setIsBonusFilter('all');
    setFilterDeadline('');
    setAppliedProject('MINISHELL');
    setAppliedBonus('all');
    setAppliedDeadline('');
    fetchRegistrations('MINISHELL', 'all', '');
  };

  /**
   * Create a new registration
   */
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/project-registrations`, formData, config);
      setShowCreateModal(false);
      setFormData({ projectName: 'MINISHELL', description: '', isBonus: false, deadline: '' });
      fetchRegistrations(appliedProject, appliedBonus, appliedDeadline);
    } catch (err) {
      alert("PUBLISH_FAILED: You might already have a registration for this project.");
    }
  };

  /**
   * Delete a registration
   */
  const handleDelete = async (regId: number) => {
    if (!window.confirm("TERMINATE_BROADCAST: Are you sure you want to remove this node signal?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/project-registrations/${regId}`, config);
      fetchRegistrations(appliedProject, appliedBonus, appliedDeadline);
    } catch (err) {
      console.error("DELETE_ERROR", err);
    }
  };

  // Initial load with default filters
  useEffect(() => {
    fetchRegistrations('MINISHELL', 'all', '');
  }, []);

  return (
    <div className="finder-container">
      <style>{`
        .finder-container { padding: 40px 20px; max-width: 1100px; margin: 0 auto; font-family: 'JetBrains Mono', monospace; color: #eee; }
        .finder-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; border-bottom: 1px solid #222; padding-bottom: 20px; }
        .control-bar { display: flex; gap: 20px; margin-bottom: 30px; background: #0a0a0a; padding: 20px; border: 1px solid #1a1a1a; align-items: flex-end; flex-wrap: wrap; }
        .control-group { display: flex; flex-direction: column; gap: 5px; }
        .cyber-select { background: #000; border: 1px solid #333; color: #A2D2FF; padding: 8px; font-family: inherit; font-size: 0.8rem; outline: none; min-width: 120px; }
        .cyber-select:focus { border-color: #A2D2FF; }
        .search-btn { background: #A2D2FF; color: #000; border: none; padding: 8px 20px; font-weight: bold; cursor: pointer; font-size: 0.75rem; font-family: inherit; transition: 0.2s; align-self: flex-end; }
        .search-btn:hover { opacity: 0.85; }
        .reset-btn { background: none; border: 1px solid #444; color: #888; padding: 8px 15px; cursor: pointer; font-size: 0.7rem; font-family: inherit; transition: 0.2s; align-self: flex-end; }
        .reset-btn:hover { border-color: #A2D2FF; color: #A2D2FF; }
        .active-filters { font-size: 0.6rem; color: #444; margin-bottom: 20px; }
        .active-filters span { color: #A2D2FF; margin-left: 5px; }
        .registration-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .reg-card { background: #080808; border: 1px solid #1a1a1a; padding: 20px; border-radius: 4px; position: relative; transition: 0.3s; display: flex; flex-direction: column; justify-content: space-between; min-height: 220px; }
        .reg-card:hover { border-color: #A2D2FF; box-shadow: 0 0 15px rgba(162, 210, 255, 0.1); }
        .my-reg-card { border-left: 3px solid #A2D2FF !important; background: #0c0c0c; }
        .my-badge { position: absolute; top: 10px; left: 10px; font-size: 0.55rem; color: #A2D2FF; letter-spacing: 1px; }
        .bonus-badge { position: absolute; top: 10px; right: 10px; font-size: 0.6rem; color: #ffd700; border: 1px solid #ffd700; padding: 2px 5px; }
        .user-info { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
        .user-avatar { width: 45px; height: 45px; border-radius: 2px; border: 1px solid #333; object-fit: cover; }
        .username { font-weight: bold; color: #fff; font-size: 0.9rem; }
        .description { font-size: 0.75rem; color: #888; line-height: 1.5; min-height: 45px; margin-bottom: 15px; overflow: hidden; }
        .btn-prime { background: #A2D2FF; color: #000; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; font-size: 0.75rem; font-family: inherit; }
        .btn-outline { background: transparent; border: 1px solid #444; color: #fff; padding: 8px 15px; cursor: pointer; font-size: 0.7rem; font-family: inherit; }
        .btn-outline:hover { border-color: #A2D2FF; color: #A2D2FF; }
        .btn-delete { background: rgba(255,77,77,0.1); border: 1px solid #ff4d4d; color: #ff4d4d; padding: 8px 15px; cursor: pointer; font-size: 0.7rem; font-family: inherit; }
        .btn-delete:hover { background: rgba(255,77,77,0.2); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 3000; }
        .modal-content { background: #050505; border: 1px solid #333; padding: 30px; width: 400px; }
        .input-group { margin-bottom: 15px; }
        .input-group label { display: block; font-size: 0.6rem; color: #444; margin-bottom: 5px; }
        .cyber-input { width: 100%; background: #000; border: 1px solid #222; color: #fff; padding: 10px; font-family: inherit; box-sizing: border-box; }
        .cyber-input:focus { border-color: #A2D2FF; outline: none; }
      `}</style>

      {/* Header */}
      <div className="finder-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', letterSpacing: '-1px' }}>NODE_DISCOVERY</h1>
          <p style={{ color: '#444', fontSize: '0.7rem' }}>FIND_COMPATIBLE_UNITS_FOR_COLLABORATION</p>
        </div>
        <button className="btn-prime" onClick={() => setShowCreateModal(true)}>+ BROADCAST_REQUEST</button>
      </div>

      {/* Filter bar */}
      <div className="control-bar">
        <div className="control-group">
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

        <div className="control-group">
          <span style={{ fontSize: '0.6rem', color: '#444' }}>BONUS_TRACK</span>
          <select className="cyber-select" value={isBonusFilter} onChange={e => setIsBonusFilter(e.target.value)}>
            <option value="all">ALL_MODES</option>
            <option value="true">BONUS_ONLY</option>
            <option value="false">MANDATORY_ONLY</option>
          </select>
        </div>

        <div className="control-group">
          <span style={{ fontSize: '0.6rem', color: '#444' }}>DEADLINE_FILTER (MAX)</span>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <input
              type="date"
              className="cyber-select"
              value={filterDeadline}
              onChange={e => setFilterDeadline(e.target.value)}
            />
            {filterDeadline && (
              <button onClick={() => setFilterDeadline('')} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>[X]</button>
            )}
          </div>
        </div>

        <button className="search-btn" onClick={handleSearch}>
          [EXECUTE_SEARCH]
        </button>

        <button className="reset-btn" onClick={handleReset}>
          [RESET]
        </button>
      </div>

      {/* Display currently active filters */}
      <div className="active-filters">
        ACTIVE_FILTERS &gt;
        <span>PROJECT: {appliedProject}</span>
        <span style={{ marginLeft: '10px' }}>BONUS: {appliedBonus.toUpperCase()}</span>
        {appliedDeadline && <span style={{ marginLeft: '10px' }}>BEFORE_DEADLINE: {appliedDeadline}</span>}
      </div>

      {/* Results grid */}
      <div className="registration-grid">
        {registrations.length > 0 ? registrations.map(reg => {
          const isMine = reg.user.id === user?.id;
          return (
            <div key={reg.id} className={`reg-card ${isMine ? 'my-reg-card' : ''}`}>
              {isMine && <span className="my-badge">[MY_BROADCAST]</span>}
              {reg.isBonus && <span className="bonus-badge">★ BONUS</span>}

              <div>
                <div className="user-info" style={{ marginTop: isMine ? '10px' : '0' }}>
                  <img
                    src={reg.user.profile?.avatarUrl
                      ? `http://localhost:3000${reg.user.profile.avatarUrl}`
                      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E"}
                    className="user-avatar"
                    alt="avatar"
                  />
                  <div>
                    <div className="username">{reg.user.username} {isMine && "(YOU)"}</div>
                    <div style={{ fontSize: '0.6rem', color: '#444' }}>POSTED: {formatDate(reg.createdAt)}</div>
                  </div>
                </div>
                <p className="description">{reg.description || "NO_ADDITIONAL_INTEL..."}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #111' }}>
                <div style={{ fontSize: '0.6rem', color: '#A2D2FF' }}>
                  DEADLINE: {formatDate(reg.deadline) || "N/A"}
                </div>
                {isMine ? (
                  <button className="btn-delete" onClick={() => handleDelete(reg.id)}>TERMINATE</button>
                ) : (
                  <button className="btn-outline" onClick={() => window.location.href = `/profile/${reg.user.id}`}>VIEW_NODE</button>
                )}
              </div>
            </div>
          );
        }) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#444' }}>
            &gt; NO_DATA_PACKETS
          </div>
        )}
      </div>

      {/* Create registration modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1rem', color: '#A2D2FF', marginBottom: '20px' }}>_INIT_BROADCAST</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="input-group">
                <label>TARGET_PROJECT</label>
                <select className="cyber-input" value={formData.projectName} onChange={e => setFormData({ ...formData, projectName: e.target.value })}>
                  <option value="MINISHELL">MINISHELL</option>
                  <option value="CUB3D">CUB3D</option>
                  <option value="MINIRT">MINIRT</option>
                  <option value="WEBSERV">WEBSERV</option>
                  <option value="IRC">IRC</option>
                  <option value="FT_TRANSCENDENCE">FT_TRANSCENDENCE</option>
                </select>
              </div>
              <div className="input-group">
                <label>INTEL_DESCRIPTION</label>
                <textarea className="cyber-input" rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="input-group">
                <label>EXPECTED_DEADLINE</label>
                <input
                  type="date"
                  className="cyber-input"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="modal-bonus"
                  checked={formData.isBonus}
                  onChange={e => setFormData({ ...formData, isBonus: e.target.checked })}
                />
                <label htmlFor="modal-bonus" style={{ margin: 0, fontSize: '0.7rem', color: '#888' }}>ENABLE_BONUS</label>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-prime" style={{ flex: 1 }}>EXECUTE</button>
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