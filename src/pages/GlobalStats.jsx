import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { modulesData } from '../data/modules.js';
import ModuleIcon from '../components/Icons';
import { sendAggregatedResultEmail } from '../services/emailService';
import Swal from 'sweetalert2';
import '../styles/Platform.css';

const GlobalStats = () => {
  const [completedModules, setCompletedModules] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [globalAggregates, setGlobalAggregates] = useState({ avg: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // 1. Load current user progress (localStorage)
      const savedProgress = JSON.parse(localStorage.getItem(`progress_${user.id}`)) || [];
      setCompletedModules(savedProgress);

      // 2. Load Leaderboard & Global Metrics from Supabase
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('user_id, module_id, score');

        if (!error && data) {
          // Aggregate scores per user
          const userScores = {};
          let totalScoreSum = 0;
          data.forEach(row => {
            totalScoreSum += row.score;
            if (!userScores[row.user_id]) {
              userScores[row.user_id] = { total: 0, count: 0, uniqueModules: new Set() };
            }
            userScores[row.user_id].total += row.score;
            userScores[row.user_id].count += 1;
            if (row.module_id) userScores[row.user_id].uniqueModules.add(row.module_id);
          });

          setGlobalAggregates({
            avg: data.length > 0 ? Math.round(totalScoreSum / data.length) : 0,
            total: data.length
          });

          // Fetch names from user_profiles
          const userIds = Object.keys(userScores);
          let profilesMap = {};
          const { data: profiles } = await supabase
            .from('user_profiles')
            .select('user_id, full_name')
            .in('user_id', userIds);
          
          if (profiles) {
            profiles.forEach(p => { profilesMap[p.user_id] = p.full_name; });
          }

          const leaderboardEntries = userIds.map(uid => {
            const isMe = uid === user.id;
            // Name priority: 1. Profiles Table, 2. Auth Metadata (if is me), 3. Email prefix, 4. 'Colleague'
            let displayName = profilesMap[uid];
            if (!displayName && isMe) {
              displayName = user.user_metadata?.full_name || user.email?.split('@')[0];
            }
            if (!displayName) displayName = 'Colleague';

            return {
              userId: uid,
              name: displayName,
              avgScore: Math.round(userScores[uid].total / userScores[uid].count),
              modulesCompleted: userScores[uid].uniqueModules.size || userScores[uid].count, // Fallback if old data has no module_id
              isCurrentUser: isMe
            };
          });

          // Ensure the current user is ALWAYS in the leaderboard even if they have weird sync issues
          const meInList = leaderboardEntries.find(e => e.isCurrentUser);
          if (!meInList && user) {
             // Fallback to add current user metrics if for some reason they aren't in the DB fetch
             // (usually happens if they have 0 progress rows)
          }

          leaderboardEntries.sort((a, b) => b.avgScore - a.avgScore);
          setLeaderboard(leaderboardEntries.slice(0, 5));
        }
      } catch (err) {
        console.error("Leaderboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const userPercent = Math.round((completedModules.length / modulesData.length) * 100) || 0;
  const completedModulesList = modulesData.filter(m => completedModules.includes(m.id));
  const missingModulesList = modulesData.filter(m => !completedModules.includes(m.id));

  const handleSendReport = async () => {
    Swal.fire({ 
      title: 'Generating Report...', 
      text: 'Gathering your full training metrics.',
      allowOutsideClick: false, 
      didOpen: () => { Swal.showLoading(); },
      background: '#111', color: '#fff'
    });
    
    const emailResult = await sendAggregatedResultEmail(user, completedModulesList, missingModulesList, userPercent);
    
    if (emailResult.success) {
      await Swal.fire({ icon: 'success', title: 'Report Dispatched', text: 'Full training report sent to your inbox!', background: '#111', color: '#fff' });
    } else {
      await Swal.fire({ icon: 'error', title: 'Network Error', text: 'Email report could not be delivered.', background: '#111', color: '#fff' });
    }
  };

  return (
    <div className="global-stats-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Global Stats</h1>
        <p className="page-subtitle">School-wide awareness metrics and leaderboards.</p>
      </div>

      {loading ? (
        <div style={{ color: 'white' }}>Gathering intelligence...</div>
      ) : (
        <div className="profile-grid" style={{ maxWidth: '1200px' }}>
          
          {/* Top 3 Summary Cards */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div className="profile-card" style={{ flex: 1, minWidth: '250px' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0' }}>Average Passing Score</p>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: globalAggregates.avg >= 80 ? '#10b981' : '#f87171' }}>
                {globalAggregates.avg}%
              </div>
            </div>
            <div className="profile-card" style={{ flex: 1, minWidth: '250px' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0' }}>Training Sessions Submitted</p>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#6337ff' }}>
                {globalAggregates.total}
              </div>
            </div>
            <div className="profile-card" style={{ flex: 1, minWidth: '250px' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0' }}>School Vulnerability Level</p>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: globalAggregates.avg >= 80 ? '#10b981' : '#fbbf24' }}>
                {globalAggregates.avg >= 80 ? 'Low' : 'Medium'}
              </div>
            </div>
          </div>

          {/* Left Column: My Personal Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="profile-card">
              <div className="profile-card-header">
                <h3>My Progress</h3>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span>Completeness</span>
                  <span>{userPercent}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${userPercent}%`, height: '100%', background: '#c084fc' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => navigate('/learning-path')}
                  style={{ flex: 1, padding: '12px', background: 'rgba(99,55,255,0.1)', border: '1px solid #6337ff', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Continue Learning
                </button>
                <button 
                  onClick={handleSendReport}
                  style={{ padding: '12px', background: '#6337ff', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Email Full Report"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </button>
              </div>
            </div>

            <div className="profile-card">
              <div className="profile-card-header">
                <h3>Missing Modules</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {modulesData.filter(m => !completedModules.includes(m.id)).slice(0, 3).map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                    <ModuleIcon type={m.type} size={14} color="#f87171" />
                    <span style={{ fontSize: '14px' }}>{m.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: The Leaderboard */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Company Leaderboard</h3>
              <p>Top performers across all departments.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {leaderboard.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No data yet.</div>
              ) : leaderboard.map((person, idx) => (
                <div key={person.userId || idx} style={{ 
                  display: 'flex', alignItems: 'center', gap: '16px', 
                  padding: '16px', 
                  background: person.isCurrentUser ? 'rgba(99,55,255,0.15)' : 'rgba(255,255,255,0.02)', 
                  border: person.isCurrentUser ? '1px solid #6337ff' : '1px solid transparent',
                  borderRadius: '8px' 
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'rgba(255,255,255,0.5)', width: '30px' }}>
                    #{idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{person.name} {person.isCurrentUser ? '(You)' : ''}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{person.modulesCompleted} modules completed</div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: person.isCurrentUser ? '#6337ff' : '#fff' }}>
                    {person.avgScore}%
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default GlobalStats;
