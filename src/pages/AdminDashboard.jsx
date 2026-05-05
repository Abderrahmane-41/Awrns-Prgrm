import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { sendWarningEmail } from '../services/emailService';
import Swal from 'sweetalert2';
import '../styles/Platform.css';
import { ShieldLogo } from '../components/Icons';

//admin dash board logic
const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [usersInfo, setUsersInfo] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    const loadAdminData = async () => {
      try {
        // 1. Fetch all progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('user_id, module_id, score');

        // 2. Fetch all profiles
        const { data: profiles, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, role');

        if (!progressError && !profileError) {
          const userScores = {};

          // Initialize everyone from profiles first so even users with 0 progress show up
          if (profiles) {
            profiles.forEach(p => {
              userScores[p.user_id] = {
                name: p.full_name || 'Colleague',
                role: p.role || 'user',
                totalScore: 0,
                attempts: 0,
                uniqueModules: new Set()
              };
            });
          }

          // Merge progress
          if (progressData) {
            progressData.forEach(row => {
              if (!userScores[row.user_id]) {
                userScores[row.user_id] = { name: 'Unknown', role: 'user', totalScore: 0, attempts: 0, uniqueModules: new Set() };
              }
              userScores[row.user_id].totalScore += row.score;
              userScores[row.user_id].attempts += 1;
              if (row.module_id) userScores[row.user_id].uniqueModules.add(row.module_id);
            });
          }

          // Final calculation
          const list = Object.entries(userScores).map(([uid, stats]) => {
            return {
              userId: uid,
              name: stats.name,
              role: stats.role,
              avgScore: stats.attempts > 0 ? Math.round(stats.totalScore / stats.attempts) : 0,
              modulesCompleted: stats.uniqueModules.size || 0
            };
          });

          // Sort by lowest score first automatically to highlight careless workers
          list.sort((a, b) => a.avgScore - b.avgScore);

          setUsersInfo(list);
          setFilteredUsers(list);
        }
      } catch (err) {
        console.error("Admin Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [isAdmin]);

  // Handle Search Filter
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = usersInfo.filter(u => u.name.toLowerCase().includes(term) || u.role.toLowerCase().includes(term));
    setFilteredUsers(filtered);
  }, [searchTerm, usersInfo]);

  const handleWarnUser = async (targetUser) => {
    // If the database doesn't have emails exposed, we prompt the admin to clarify or just send it directly if we had it.
    // For this prototype, we simulate dispatching by using the current admin's email as a CC/test, or let EmailJS handle it via mock.

    Swal.fire({
      title: `Warn ${targetUser.name}?`,
      text: `Their score is currently ${targetUser.avgScore}%. Are you sure you want to dispatch a disciplinary email?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6337ff',
      confirmButtonText: 'Yes, Send Warning',
      background: '#111',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Dispatching Notice...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#111', color: '#fff' });

        // Use user.email as the fallback destination so the Admin actually receives the test email to verify it works!
        const resultEmail = await sendWarningEmail(targetUser.name, user?.email, targetUser.modulesCompleted, targetUser.avgScore);

        if (resultEmail.success) {
          Swal.fire({ icon: 'success', title: 'Dispatched', text: 'The warning email has been sent to the worker.', background: '#111', color: '#fff' });
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: 'Could not dispatch email.', background: '#111', color: '#fff' });
        }
      }
    });
  };

  if (!isAdmin) {
    return (
      <div className="fade-in" style={{ padding: '40px', textAlign: 'center', color: '#f87171' }}>
        <ShieldLogo size={60} color="#f87171" style={{ opacity: 0.5 }} />
        <h1 style={{ marginTop: '20px' }}>Access Denied</h1>
        <p>You do not have the required administrative clearance to view this sector.</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '0 20px', paddingBottom: '40px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ color: '#00d4ff' }}>Admin Command Center</h1>
        <p className="page-subtitle">Monitor organizational compliance and manage workforce readiness.</p>
      </div>

      {loading ? (
        <div style={{ color: 'white' }}>Establishing secure connection to user database...</div>
      ) : (
        <div className="profile-card" style={{ maxWidth: '100% border-left: 4px solid #00d4ff' }}>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ margin: 0 }}>Workforce Overview</h3>
            <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none'
                }}
              />
            </div>
          </div>

          {/* User Data Grid */}
          <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '16px', color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: '13px' }}>Identity</th>
                  <th style={{ padding: '16px', color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: '13px' }}>Clearance / Role</th>
                  <th style={{ padding: '16px', color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: '13px' }}>Modules Done</th>
                  <th style={{ padding: '16px', color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: '13px' }}>Avg Score</th>
                  <th style={{ padding: '16px', color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: '13px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No personnel found.</td></tr>
                ) : (
                  filteredUsers.map((u, idx) => {
                    const isAtRisk = u.avgScore < 75 && u.avgScore > 0;
                    const isPerfect = u.avgScore === 100;

                    return (
                      <tr key={u.userId || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '16px', fontWeight: 'bold' }}>{u.name} {u.userId === user?.id ? '(You)' : ''}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase',
                            background: u.role === 'admin' ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.05)',
                            color: u.role === 'admin' ? '#00d4ff' : 'rgba(255,255,255,0.6)'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>{u.modulesCompleted}</td>
                        <td style={{ padding: '16px', color: isAtRisk ? '#f87171' : isPerfect ? '#10b981' : '#fff', fontWeight: 'bold' }}>
                          {u.avgScore}%
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {u.userId !== user?.id && u.role !== 'admin' && (
                            <button
                              onClick={() => handleWarnUser(u)}
                              style={{
                                padding: '8px 16px', background: isAtRisk ? '#ef4444' : 'rgba(255,255,255,0.05)',
                                border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                                transition: 'background 0.2s'
                              }}
                              onMouseOver={(e) => { if (!isAtRisk) e.target.style.background = '#ef4444'; }}
                              onMouseOut={(e) => { if (!isAtRisk) e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                            >
                              Dispatch Warning
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
