import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AUTH_TOKEN_KEY } from '@/utils/constants';

// --- Interfaces ---
interface Group {
  id: number;
  name: string;
  projectName: string;
  description?: string;
  isBonus: boolean;
  deadline?: string; // Date stored as ISO string from backend
  ownerId: number;
}

interface GroupMembership {
  role: string;
  joinedAt: string;
  group: Group;
}

interface Invitation {
  id: number;
  group: Group;
  inviterId?: number;
  invitedBy?: { username: string };
}

const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my_groups' | 'invitations'>('my_groups');
  const [memberships, setMemberships] = useState<GroupMembership[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state including the new deadline field
  const [formData, setFormData] = useState({
    name: '',
    projectName: 'MINISHELL',
    description: '',
    isBonus: false,
    deadline: '' // Controlled input for type="date"
  });

  const BACKEND_URL = ''; 
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch groups where the user is a member or owner
  const fetchMyGroups = async () => {
    try {
        const res = await axios.get(`${BACKEND_URL}/api/groups/me?t=${Date.now()}`, config);
        setMemberships(res.data);
    } catch (err) {
        console.error("ERR_FETCH_MY_GROUPS", err);
    }
  };

  // Fetch pending invitations for the user
  const fetchReceivedInvitations = async () => {
    try {
        const res = await axios.get(`${BACKEND_URL}/api/groups/invitations/received`, config);
        setInvitations(res.data);
    } catch (err) {
        console.error("ERR_FETCH_INVITES", err);
    }
  };

  // Logic to handle group creation
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Sends formData (including deadline) to the backend API
      await axios.post(`${BACKEND_URL}/api/groups`, formData, config);
      setIsCreateModalOpen(false);
      // Reset form to default values
      setFormData({ name: '', projectName: 'MINISHELL', description: '', isBonus: false, deadline: '' });
      fetchMyGroups();
    } catch (err) {
      alert("CREATE_FAILED: Check backend connectivity or validation");
    }
  };

  const handleAcceptInvite = async (inviteId: number) => {
    try {
      await axios.post(`${BACKEND_URL}/api/groups/invitations/${inviteId}/accept`, {}, config);
      fetchReceivedInvitations();
      fetchMyGroups();
    } catch (err) {
      alert("ACCEPT_FAILED");
    }
  };

  useEffect(() => {
    if (activeTab === 'my_groups') fetchMyGroups();
    if (activeTab === 'invitations') fetchReceivedInvitations();
  }, [activeTab]);

  return (
    <div className="groups-container">
      <style>{`
        .groups-container { padding: 40px 20px; max-width: 1000px; margin: 0 auto; font-family: 'JetBrains Mono', monospace; color: #eee; }
        .groups-nav { display: flex; gap: 20px; border-bottom: 1px solid #222; margin-bottom: 30px; }
        .nav-item { padding: 10px 0; cursor: pointer; color: #444; font-size: 0.8rem; position: relative; }
        .nav-item.active { color: #A2D2FF; }
        .nav-item.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #A2D2FF; }
        .group-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        
        .group-card { 
          background: #0a0a0a; 
          border: 1px solid #1a1a1a; 
          padding: 20px; 
          border-radius: 4px; 
          transition: 0.3s; 
          display: flex; 
          flex-direction: column; 
          min-height: 220px;
        }
        .group-card:hover { border-color: #A2D2FF; box-shadow: 0 0 15px rgba(162, 210, 255, 0.05); }
        
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
        .project-label { font-size: 0.6rem; color: #A2D2FF; border: 1px solid #A2D2FF; padding: 2px 6px; }
        .role-badge { font-size: 0.5rem; padding: 2px 6px; border-radius: 2px; }
        .role-owner { color: #ffd700; border: 1px solid #ffd700; }
        .role-member { color: #888; border: 1px solid #444; }
        
        .btn-action { background: #A2D2FF; color: #000; border: none; padding: 8px 16px; font-weight: bold; cursor: pointer; font-size: 0.7rem; font-family: inherit; }
        .btn-secondary { background: none; border: 1px solid #444; color: #fff; padding: 8px 16px; cursor: pointer; font-size: 0.7rem; font-family: inherit; }
        .btn-secondary:hover { border-color: #A2D2FF; color: #A2D2FF; }
        
        /* Modal styling with scroll support for long forms */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 3000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .modal-body { 
            background: #050505; 
            border: 1px solid #333; 
            width: 450px; 
            max-width: 95vw; 
            max-height: 90vh; 
            overflow-y: auto; 
            padding: 30px; 
            box-shadow: 0 0 40px rgba(0,0,0,1); 
        }
        .input-cyber { 
            width: 100%; 
            background: #000; 
            border: 1px solid #222; 
            color: #fff; 
            padding: 10px; 
            margin-bottom: 15px; 
            font-family: inherit; 
            font-size: 0.8rem; 
            box-sizing: border-box; 
            color-scheme: dark; /* Ensures date picker icons are visible in dark mode */
        }
        .input-cyber:focus { border-color: #A2D2FF; outline: none; }
      `}</style>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', letterSpacing: '-1px' }}>CELL_NETWORKS</h1>
          <p style={{ color: '#444', fontSize: '0.7rem' }}>PROJECT_TEAM_MANAGEMENT_INTERFACE</p>
        </div>
        <button className="btn-action" onClick={() => setIsCreateModalOpen(true)}>+ INITIALIZE_GROUP</button>
      </div>

      {/* Navigation Tabs */}
      <div className="groups-nav">
        <div className={`nav-item ${activeTab === 'my_groups' ? 'active' : ''}`} onClick={() => setActiveTab('my_groups')}>
          [MY_CELLS]
        </div>
        <div className={`nav-item ${activeTab === 'invitations' ? 'active' : ''}`} onClick={() => setActiveTab('invitations')}>
          [INVITATIONS] {invitations.length > 0 && <span style={{ color: '#ff4d4d' }}>({invitations.length})</span>}
        </div>
      </div>

      {/* Display List of Groups */}
      <div className="content-area">
        {activeTab === 'my_groups' && (
          <div className="group-grid">
            {memberships.length > 0 ? memberships.map((m) => (
              <div key={`group-${m.group.id}`} className="group-card">
                <div className="card-header">
                  <span className="project-label">{m.group.projectName}</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {m.group.isBonus && <span style={{ color: '#ffd700', fontSize: '0.6rem' }}>★ BONUS</span>}
                    <span className={`role-badge ${m.role === 'owner' ? 'role-owner' : 'role-member'}`}>
                      {m.role.toUpperCase()}
                    </span>
                  </div>
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>{m.group.name}</h3>
                
                {/* Visualizing the Deadline on the Card */}
                <div style={{ fontSize: '0.6rem', color: '#A2D2FF', marginBottom: '10px', fontWeight: 'bold' }}>
                  DEADLINE: {m.group.deadline ? new Date(m.group.deadline).toLocaleDateString() : 'NOT_SET'}
                </div>

                <p style={{ fontSize: '0.7rem', color: '#666', flexGrow: 1, overflow: 'hidden', lineHeight: '1.4' }}>
                  {m.group.description || "NO_MISSION_DESCRIPTION_PROVIDED"}
                </p>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => navigate(`/groups/${m.group.id}`)}>
                    ACCESS_DATA
                  </button>
                </div>
              </div>
            )) : (
              <p style={{ color: '#444', fontSize: '0.8rem' }}>&gt; NO_ACTIVE_GROUPS_FOUND</p>
            )}
          </div>
        )}

        {/* Invitations Section */}
        {activeTab === 'invitations' && (
          <div className="invitation-list">
            {invitations.length > 0 ? invitations.map((inv, idx) => (
              <div key={`inv-${inv.id || idx}`} className="invite-item" style={{ background: '#0f0f0f', border: '1px solid #222', padding: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ paddingLeft: '20px' }}>
                  <div style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: '#A2D2FF' }}>
                        {inv.invitedBy?.username || (inv as any).inviterId || 'UNKNOWN_USER'}
                    </span> invited you to join
                    <span style={{ color: '#fff' }}> {inv.group?.name || 'Unknown Cell'}</span>
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#444', marginTop: '5px' }}>
                    PROJECT: {inv.group?.projectName || 'UNDEFINED'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', paddingRight: '20px' }}>
                  <button className="btn-action" onClick={() => handleAcceptInvite(inv.id)}>ACCEPT</button>
                  <button className="btn-secondary" style={{ color: '#ff5555', borderColor: '#400' }}>REJECT</button>
                </div>
              </div>
            )) : (
              <p style={{ color: '#444', fontSize: '0.8rem' }}>&gt; NO_PENDING_INVITATIONS</p>
            )}
          </div>
        )}
      </div>

      {/* --- CREATE NEW GROUP MODAL --- */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-body" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#A2D2FF' }}>_CREATE_NEW_CELL</h2>
            <form onSubmit={handleCreateGroup}>
              
              <label style={{ fontSize: '0.6rem', color: '#444' }}>CELL_NAME</label>
              <input
                className="input-cyber"
                required
                autoFocus
                placeholder="Enter group name..."
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />

              <label style={{ fontSize: '0.6rem', color: '#444' }}>PROJECT_TYPE</label>
              <select
                className="input-cyber"
                value={formData.projectName}
                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
              >
                <option value="MINISHELL">MINISHELL</option>
                <option value="CUB3D">CUB3D</option>
                <option value="MINIRT">MINIRT</option>
                <option value="WEBSERV">WEBSERV</option>
                <option value="IRC">IRC</option>
                <option value="FT_TRANSCENDENCE">FT_TRANSCENDENCE</option>
              </select>

              {/* NEW FIELD: MISSION DEADLINE */}
              <label style={{ fontSize: '0.6rem', color: '#A2D2FF', fontWeight: 'bold' }}>MISSION_DEADLINE</label>
              <input
                type="date"
                className="input-cyber"
                required
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              />

              <label style={{ fontSize: '0.6rem', color: '#444' }}>MISSION_DESCRIPTION</label>
              <textarea
                className="input-cyber" 
                rows={3}
                placeholder="Briefly describe group goals..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />

              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox" 
                  id="bonus"
                  checked={formData.isBonus}
                  onChange={e => setFormData({ ...formData, isBonus: e.target.checked })}
                />
                <label htmlFor="bonus" style={{ fontSize: '0.7rem', marginLeft: '10px', color: '#888', cursor: 'pointer' }}>
                  BONUS_MISSION_ENABLED
                </label>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button type="submit" className="btn-action" style={{ flex: 1 }}>INITIALIZE</button>
                <button type="button" className="btn-secondary" onClick={() => setIsCreateModalOpen(false)} style={{ flex: 1 }}>ABORT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;