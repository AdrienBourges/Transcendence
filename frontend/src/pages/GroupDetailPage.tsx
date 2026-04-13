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

  const BACKEND_URL = 'http://localhost:3000';
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const DEFAULT_AVATAR =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23A2D2FF'/%3E%3C/svg%3E";

  // --- Fetch group data ---
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

  // --- Leave group ---
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

  // --- Remove member ---
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

  // --- Cancel invitation ---
  const handleCancelInvite = async (invitationId: number) => {
    if (!window.confirm("Cancel this invitation?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/groups/invitations/${invitationId}`, config);
      fetchGroupData();
    } catch {
      alert("Failed to cancel invitation");
    }
  };

  // --- Send invitation ---
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

  // --- Delete group ---
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
        .header-box { border-left: 4px solid #A2D2FF; padding-left: 20px; margin-bottom: 30px; }
        .btn-primary { background: #A2D2FF; color: #000; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; font-size: 0.75rem; }
        .btn-outline { background: none; border: 1px solid #333; color: #fff; padding: 10px 20px; cursor: pointer; font-size: 0.75rem; }
        .btn-danger { background: none; border: 1px solid #400; color: #f55; padding: 10px 20px; cursor: pointer; font-size: 0.75rem; }
        .cyber-input { background: #000; border: 1px solid #222; color: #fff; padding: 8px 12px; width: 100%; }
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
          <div style={{ color: '#A2D2FF', fontSize: '0.6rem' }}>
            PROJECT: {group.projectName}
          </div>
          <h1>{group.name}</h1>
          <p style={{ color: '#888' }}>
            {group.description || "NO DESCRIPTION AVAILABLE"}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          {isOwner ? (
            <>
              <button className="btn-primary" onClick={() => setIsInviteModalOpen(true)}>
                + Invite Member
              </button>
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
                  style={{ width: '32px', height: '32px' }}
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

      {isInviteModalOpen && (
        <div className="overlay" onClick={() => setIsInviteModalOpen(false)}>
          <div style={{ background: '#050505', padding: '30px', width: '320px', border: '1px solid #333' }} onClick={e => e.stopPropagation()}>
            <div style={{ color: '#A2D2FF', marginBottom: '15px', fontSize: '0.8rem' }}>Invite Member</div>

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
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsInviteModalOpen(false)}>
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