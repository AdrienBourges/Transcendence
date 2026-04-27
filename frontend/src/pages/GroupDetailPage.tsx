import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AUTH_TOKEN_KEY } from '@/utils/constants';
import { useAuthStore } from '@/store/useAuthStore';

// --- Interfaces ---
interface Member {
  id: number;
  user?: { id: number; username?: string };
  profile?: { avatarUrl?: string };
}

interface GroupDetail {
  id: number;
  name: string;
  projectName: string;
  description: string;
  deadline?: string;
  isBonus?: boolean;
  owner: { id: number; username: string };
}

interface Invitation {
  id: number;
  invitedUserId: number;
  status: string;
  invitedUser?: {
    username: string;
  };
}

const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: me } = useAuthStore();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Edit Mode State ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    projectName: '',
    description: '',
    deadline: '',
    isBonus: false
  });

  const BACKEND_URL = '';
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const DEFAULT_AVATAR =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E";

  // --- Fetch group data from API ---
  const fetchGroupData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [groupRes, membersRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/groups/${id}`, config),
        axios.get(`${BACKEND_URL}/api/groups/${id}/members`, config),
      ]);

      setGroup(groupRes.data);
      setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);

      // Pre-fill the edit form with existing data
      setEditForm({
        name: groupRes.data.name,
        projectName: groupRes.data.projectName,
        description: groupRes.data.description || '',
        deadline: groupRes.data.deadline ? groupRes.data.deadline.split('T')[0] : '',
        isBonus: groupRes.data.isBonus || false
      });

      // Fetch pending invitations if the current user is the owner
      if (Number(me?.id) === Number(groupRes.data.owner?.id)) {
        const invRes = await axios.get(`${BACKEND_URL}/api/groups/${id}/invitations`, config);
        const pendingInvs = Array.isArray(invRes.data)
          ? invRes.data.filter((inv: any) => inv.status.toUpperCase() === 'PENDING')
          : [];
        setInvitations(pendingInvs);
      }
    } catch (error) {
      console.error("FETCH_GROUP_ERROR", error);
      setGroup(null);
    } finally {
      setLoading(false);
    }
  }, [id, token, me?.id]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  // --- Update Group (Owner Only) ---
  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch(`${BACKEND_URL}/api/groups/${id}`, editForm, config);
      setIsEditing(false);
      fetchGroupData();
      alert("SUCCESS: Group data updated.");
    } catch (error: any) {
      alert(error.response?.data?.message || "UPDATE_FAILED");
    }
  };

  // --- Leave group logic ---
  const handleLeaveGroup = async () => {
    if (!me?.id) return;
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      await axios.delete(
        `${BACKEND_URL}/api/groups/${id}/members/${me.id}`,
        config
      );
      navigate('/?section=groups');
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to leave group");
    }
  };

  // --- Remove a specific member (Owner Only) ---
  const handleKickMember = async (targetUserId: number) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await axios.delete(
        `${BACKEND_URL}/api/groups/${id}/members/${targetUserId}`,
        config
      );
      fetchGroupData();
    } catch {
      alert("Failed to remove member");
    }
  };

  // --- Cancel a pending invitation (Owner Only) ---
  const handleCancelInvite = async (invitationId: number) => {
    if (!window.confirm("Cancel this invitation?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/groups/invitations/${invitationId}`, config);
      fetchGroupData();
    } catch {
      alert("Failed to cancel invitation");
    }
  };

  // --- Send a new invitation ---
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = Number(searchQuery.trim());
    if (isNaN(targetId)) {
      alert("Please enter a valid user ID");
      return;
    }
    try {
      await axios.post(
        `${BACKEND_URL}/api/groups/${id}/invitations`,
        { invitedUserId: targetId },
        config
      );
      alert("Invitation sent");
      setIsInviteModalOpen(false);
      setSearchQuery('');
      fetchGroupData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Invitation failed");
    }
  };

  // --- Permanently delete the group (Owner Only) ---
  const handleDeleteGroup = async () => {
    if (!window.confirm("Warning: This action is irreversible. Delete group?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/groups/${id}`, config);
      navigate('/?section=groups');
    } catch {
      alert("Failed to delete group");
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#000', height: '100vh', color: '#A2D2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono' }}>
        &gt; LOADING_GROUP_DATA...
      </div>
    );
  }

  if (!group) {
    return (
      <div style={{ background: '#000', height: '100vh', color: '#f55', padding: '40px', fontFamily: 'JetBrains Mono' }}>
        &gt; ERROR: GROUP_NOT_FOUND
      </div>
    );
  }

  const isOwner =
    me?.id &&
    group?.owner?.id &&
    Number(me.id) === Number(group.owner.id);

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#eee', fontFamily: "'JetBrains Mono', monospace" }}>
      <style>{`
        .container { padding: 40px 20px; max-width: 900px; margin: 0 auto; }
        .back-nav { color: #666; font-size: 0.7rem; cursor: pointer; margin-bottom: 20px; display: inline-block; }
        
        /* Updated header-box to prevent overlapping */
        .header-box { border-left: 4px solid #A2D2FF; padding: 20px; background: rgba(162, 210, 255, 0.02); margin-bottom: 30px; }
        
        .status-bar { display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; }
        
        .btn-primary { background: #A2D2FF; color: #000; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; font-size: 0.75rem; transition: 0.2s; }
        .btn-primary:hover { opacity: 0.8; }
        
        .btn-outline { background: none; border: 1px solid #333; color: #fff; padding: 10px 20px; cursor: pointer; font-size: 0.75rem; }
        .btn-danger { background: none; border: 1px solid #400; color: #f55; padding: 10px 20px; cursor: pointer; font-size: 0.75rem; }
        
        .edit-trigger { font-size: 0.6rem; color: #A2D2FF; border: 1px solid #A2D2FF; padding: 2px 8px; cursor: pointer; text-transform: uppercase; }
        .edit-trigger:hover { background: #A2D2FF; color: #000; }

        .cyber-input { background: #000; border: 1px solid #222; color: #fff; padding: 8px 12px; width: 100%; font-family: inherit; margin-bottom: 10px; color-scheme: dark; box-sizing: border-box; }
        .cyber-input:focus { border-color: #A2D2FF; outline: none; }

        .member-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px; margin-top: 20px; }
        .member-card { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 12px; display: flex; align-items: center; gap: 12px; position: relative; }
        .kick-btn { position: absolute; right: 8px; top: 8px; background: none; border: none; color: #400; cursor: pointer; font-size: 0.6rem; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .cancel-btn { color: #f55; border: 1px solid #400; padding: 2px 6px; font-size: 0.55rem; cursor: pointer; background: transparent; }
      `}</style>

      <div className="container">
        <div className="back-nav" onClick={() => navigate('/?section=groups')}>
          &lt; Back to index
        </div>

        <div className="header-box">
          {isEditing ? (
            /* --- RENDER EDIT FORM --- */
            <form onSubmit={handleUpdateGroup}>
              <div style={{ color: '#A2D2FF', fontSize: '0.6rem', marginBottom: '15px' }}>&gt; ACCESSING_DATABASE_MODIFY_MODE...</div>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <select 
                  className="cyber-input" 
                  style={{ flex: 1, minWidth: '150px' }}
                  value={editForm.projectName}
                  onChange={e => setEditForm({...editForm, projectName: e.target.value})}
                >
                  <option value="MINISHELL">MINISHELL</option>
                  <option value="CUB3D">CUB3D</option>
                  <option value="MINIRT">MINIRT</option>
                  <option value="WEBSERV">WEBSERV</option>
                  <option value="IRC">IRC</option>
                  <option value="FT_TRANSCENDENCE">FT_TRANSCENDENCE</option>
                </select>
                <input 
                  type="date" 
                  className="cyber-input" 
                  style={{ flex: 1, minWidth: '150px' }}
                  value={editForm.deadline}
                  onChange={e => setEditForm({...editForm, deadline: e.target.value})}
                />
              </div>

              <input 
                className="cyber-input"
                required
                value={editForm.name}
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                placeholder="GROUP_NAME"
              />
              
              <textarea 
                className="cyber-input"
                rows={3}
                value={editForm.description}
                onChange={e => setEditForm({...editForm, description: e.target.value})}
                placeholder="MISSION_DESCRIPTION"
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <button type="submit" className="btn-primary">APPLY_CHANGES</button>
                <button type="button" className="btn-outline" onClick={() => setIsEditing(false)}>ABORT</button>
              </div>
            </form>
          ) : (
            /* --- RENDER READ-ONLY HEADER --- */
            <>
              <div className="status-bar">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ color: '#A2D2FF', fontSize: '0.6rem', border: '1px solid #A2D2FF', padding: '2px 6px' }}>
                    PROJECT: {group.projectName}
                  </span>
                  {group.isBonus && (
                    <span style={{ color: '#ffd700', fontSize: '0.6rem' }}>★ BONUS_ENABLED</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ color: '#ff4d4d', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    [DEADLINE: {group.deadline ? new Date(group.deadline).toLocaleDateString() : 'NOT_SET'}]
                  </div>
                  {isOwner && (
                    <div className="edit-trigger" onClick={() => setIsEditing(true)}>
                      EDIT_DATA
                    </div>
                  )}
                </div>
              </div>

              <h1 style={{ fontSize: '2rem', margin: '15px 0', letterSpacing: '-1px' }}>{group.name}</h1>
              <p style={{ color: '#888', fontSize: '0.8rem', lineHeight: '1.6' }}>
                {group.description || "NO MISSION DATA PROVIDED."}
              </p>
            </>
          )}
        </div>

        {/* --- Action Buttons Section --- */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          {isOwner ? (
            <>
              {!isEditing && (
                <button className="btn-primary" onClick={() => setIsInviteModalOpen(true)}>
                  + Invite Member
                </button>
              )}
              <button className="btn-danger" style={{ marginLeft: 'auto' }} onClick={handleDeleteGroup}>
                Delete Group
              </button>
            </>
          ) : (
            <button className="btn-danger" style={{ marginLeft: 'auto' }} onClick={handleLeaveGroup}>
              Leave Group
            </button>
          )}
        </div>

        {/* --- Member Management Section --- */}
        <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '5px' }}>
          Active_Members ({members.length})
        </div>

        <div className="member-grid">
          {members.map(m => {
            const username = m.user?.username || "UNKNOWN";
            const isMe = Number(m.user?.id) === Number(me?.id);
            const isOwnerMember = Number(m.user?.id) === Number(group.owner?.id);

            return (
              <div key={m.id} className="member-card">
                <img
                  src={m.profile?.avatarUrl ? `${BACKEND_URL}${m.profile.avatarUrl}` : DEFAULT_AVATAR}
                  alt="avatar"
                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ color: isMe ? '#A2D2FF' : '#eee', fontSize: '0.85rem' }}>
                    {username.toUpperCase()} {isMe && "(YOU)"}
                  </div>

                  <div style={{
                    fontSize: '0.6rem',
                    color: isOwnerMember ? '#ffd700' : '#666',
                    fontWeight: isOwnerMember ? 'bold' : 'normal'
                  }}>
                    {isOwnerMember ? "OWNER" : "MEMBER"}
                  </div>
                </div>

                {isOwner && m.user?.id !== me?.id && (
                  <button className="kick-btn" onClick={() => handleKickMember(m.user!.id)}>
                    REMOVE
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* --- Pending Invitations Section (Owner Only) --- */}
        {isOwner && invitations.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '5px' }}>
              Pending_Invitations ({invitations.length})
            </div>
            <div className="member-grid">
              {invitations.map(inv => (
                <div key={inv.id} className="member-card" style={{ borderStyle: 'dashed', borderColor: '#333' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#A2D2FF', fontSize: '0.8rem' }}>
                      {inv.invitedUser?.username
                        ? inv.invitedUser.username.toUpperCase()
                        : `USER_ID: ${inv.invitedUserId}`}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#444' }}>STATUS: PENDING</div>
                  </div>
                  <button className="cancel-btn" onClick={() => handleCancelInvite(inv.id)}>
                    CANCEL
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- Invitation Modal --- */}
      {isInviteModalOpen && (
        <div className="overlay" onClick={() => setIsInviteModalOpen(false)}>
          <div 
            style={{ background: '#050505', padding: '30px', width: '320px', border: '1px solid #333' }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ color: '#A2D2FF', marginBottom: '15px', fontSize: '0.8rem', letterSpacing: '1px' }}>_INVITE_MEMBER</div>

            <form onSubmit={handleSendInvite}>
              <input
                autoFocus
                className="cyber-input"
                placeholder="Enter User ID"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="btn-primary" style={{ flex: 1 }}>Send</button>
                <button 
                  type="button" 
                  className="btn-outline" 
                  style={{ flex: 1 }} 
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailPage;