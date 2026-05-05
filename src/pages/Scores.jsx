import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { modulesData } from '../data/modules.js';
import ModuleIcon from '../components/Icons';
import { sendAggregatedResultEmail } from '../services/emailService';
import Swal from 'sweetalert2';
import '../styles/Platform.css';

const Scores = () => {
  const [completedModules, setCompletedModules] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // 1. Load user's own progress from localStorage (the single source of truth used by LearningPath)
      const savedProgress = JSON.parse(localStorage.getItem(`progress_${user.id}`)) || [];
      setCompletedModules(savedProgress);

      // 2. Try loading leaderboard from Supabase (all users' aggregated scores)
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('user_id, score');

        if (!error && data && data.length > 0) {
          // Aggregate: calculate average score per user
          const userScores = {};
          data.forEach(row => {
            if (!userScores[row.user_id]) {
              userScores[row.user_id] = { total: 0, count: 0 };
            }
            userScores[row.user_id].total += row.score;
            userScores[row.user_id].count += 1;
          });

          // Fetch real names from the profiles table
          const userIds = Object.keys(userScores);
          let profilesMap = {};
          try {
            const { data: profiles, error: profileError } = await supabase
              .from('user_profiles')
              .select('user_id, full_name')
              .in('user_id', userIds);
            
            if (profiles) {
              profiles.forEach(p => { profilesMap[p.user_id] = p.full_name; });
            }
          } catch (e) {
             console.error("Leaderboard Name Fetch Error:", e);
          }

          const leaderboardEntries = [];
          for (const [userId, scores] of Object.entries(userScores)) {
            const avg = Math.round(scores.total / scores.count);
            let displayName = profilesMap[userId] || 'Colleague';
            if (userId === user.id) {
              displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'You';
            }
            leaderboardEntries.push({
              userId,
              name: displayName,
              avgScore: avg,
              modulesCompleted: scores.count,
              isCurrentUser: userId === user.id
            });
          }

          leaderboardEntries.sort((a, b) => b.avgScore - a.avgScore);
          setLeaderboard(leaderboardEntries.slice(0, 5));
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  // Derived Metrics
  const completedCount = completedModules.length;
  const missingCount = modulesData.length - completedCount;
  const overallCompleteness = Math.round((completedCount / modulesData.length) * 100) || 0;

  const missingModules = modulesData.filter(m => !completedModules.includes(m.id));
  const completedModulesList = modulesData.filter(m => completedModules.includes(m.id));

  const handleSendReport = async () => {
    Swal.fire({ 
      title: 'Generating Report...', 
      text: 'Gathering your full training metrics.',
      allowOutsideClick: false, 
      didOpen: () => { Swal.showLoading(); },
      background: '#111', color: '#fff'
    });
    
    const emailResult = await sendAggregatedResultEmail(user, completedModulesList, missingModules, overallCompleteness);
    
    if (emailResult.success) {
      await Swal.fire({ icon: 'success', title: 'Report Dispatched', text: 'Full training report sent to your inbox!', background: '#111', color: '#fff' });
    } else {
      await Swal.fire({ icon: 'error', title: 'Network Error', text: 'Email report could not be delivered.', background: '#111', color: '#fff' });
    }
  };

  // If Supabase leaderboard is empty, show at least the current user
  const displayLeaderboard = leaderboard.length > 0 ? leaderboard : [
    {
      userId: user?.id,
      name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You',
      avgScore: overallCompleteness,
      modulesCompleted: completedCount,
      isCurrentUser: true
    }
  ];

  return (
    <div className="scores-page fade-in">
      <div className="page-header">
        <h1 className="page-title">My Progress and Leaderboard</h1>
        <p className="page-subtitle">Track your completeness and compare with colleagues.</p>
      </div>

      {loading ? (
        <div style={{ color: 'white' }}>Loading metrics...</div>
      ) : (
        <div className="profile-grid" style={{ maxWidth: '1200px' }}>
          
          {/* Top Metrics Card */}
          <div className="profile-card" style={{ gridColumn: '1 / -1', flexDirection: 'row', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Security Awareness Completeness</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: overallCompleteness === 100 ? '#10b981' : '#6337ff' }}>
                {overallCompleteness}%
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '16px' }}>
                <div style={{ width: `${overallCompleteness}%`, height: '100%', background: overallCompleteness === 100 ? '#10b981' : 'linear-gradient(90deg, #6337ff, #c084fc)', transition: 'width 1s ease' }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', minWidth: '120px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{completedCount}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Completed</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', minWidth: '120px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f87171' }}>{missingCount}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Missing</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={handleSendReport} className="modern-swal-btn" style={{ padding: '16px 24px', fontSize: '14px', margin: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Email Full Report
                </button>
              </div>
            </div>
          </div>

          {/* Left Column: Completed & Missing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Completed Modules */}
            {completedModulesList.length > 0 && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3>Completed Training</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {completedModulesList.map(mod => (
                    <div key={mod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: '16px', borderRadius: '8px' }}>
                      <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ModuleIcon type={mod.type} size={16} color="#10b981" /> {mod.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>Passed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Modules */}
            {missingModules.length > 0 && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3>Action Required: Missing Modules</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {missingModules.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '16px', borderRadius: '8px' }}>
                      <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ModuleIcon type={m.type} size={16} color="#f87171" /> {m.title}
                      </span>
                      <button onClick={() => navigate(`/quiz/${m.id}`)} style={{ padding: '6px 12px', background: '#ef4444', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Complete Now</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Real Leaderboard */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Company Leaderboard</h3>
              <p>Top performers across all departments.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {displayLeaderboard.map((person, idx) => (
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
              {leaderboard.length === 0 && (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '8px' }}>
                  Leaderboard will populate as more colleagues complete their training.
                </p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Scores;
