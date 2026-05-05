import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { ShieldLogo } from '../components/Icons';
import '../styles/Platform.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [globalRank, setGlobalRank] = useState('-');

  useEffect(() => {
    if (!user) return;
    const fetchRank = async () => {
      try {
        const { data, error } = await supabase.from('user_progress').select('user_id, score');
        if (!error && data) {
          const userScores = {};
          data.forEach(row => {
            if (!userScores[row.user_id]) userScores[row.user_id] = { total: 0, count: 0 };
            userScores[row.user_id].total += row.score;
            userScores[row.user_id].count += 1;
          });
          const leaderboardEntries = Object.entries(userScores).map(([uid, stats]) => ({
            userId: uid,
            avgScore: Math.round(stats.total / stats.count)
          }));
          leaderboardEntries.sort((a, b) => b.avgScore - a.avgScore);
          const rank = leaderboardEntries.findIndex(e => e.userId === user.id) + 1;
          if (rank > 0) setGlobalRank(`#${rank}`);
        }
      } catch (err) { }
    };
    fetchRank();
  }, [user]);

  return (
    <div className="dashboard-fixed-container fade-in">
      {/* Background Ambient Glows */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>

      <div className="dashboard-content-wrapper">
        
        {/* Header Section */}
        <header className="dashboard-header-modern">
          <div className="welcome-group">
            <h1 className="welcome-text">System Access Granted</h1>
            <p className="user-identifier">Logged in as: <span>{user?.user_metadata?.full_name || user?.email}</span></p>
          </div>
          <div className="system-status">
            <div className="status-dot pulse"></div>
            <span>Network Secure</span>
          </div>
        </header>

        {/* Main Interface Grid */}
        <div className="dashboard-main-grid">
          
          {/* Hero Action Card: Start Learning */}
          <div className="dashboard-hero-card" onClick={() => navigate('/learning-path')}>
            <div className="hero-content">
              <div className="hero-icon-box">
                <ShieldLogo size={40} />
              </div>
              <h2>Resume Training</h2>
              <p>Advance through your security awareness roadmap and unlock new credentials.</p>
              <div className="hero-action-hint">Enter Learning Path →</div>
            </div>
            <div className="hero-bg-graphic"></div>
          </div>

          {/* Secondary Actions Sidebar */}
          <div className="dashboard-side-actions">
            
            {/* News / Threat Intel Widget (Integrated instead of just a button) */}
            <div className="dashboard-mini-card news-widget" onClick={() => navigate('/news')}>
              <div className="card-header-tiny">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                <span>Live Threat Intel</span>
              </div>
              <h3>AI Voice Hijacking</h3>
              <p>New active campaign targeting corporate finance departments...</p>
              <span className="read-more-link">View Bulletins</span>
            </div>

            {/* Scores Widget */}
            <div className="dashboard-mini-card scores-widget" onClick={() => navigate('/global-stats')}>
              <div className="card-header-tiny">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
                <span>Performance</span>
              </div>
              <div className="mini-score-info">
                <span className="score-label">Global Rank</span>
                <span className="score-value">{globalRank}</span>
              </div>
              <span className="read-more-link">View Leaderboard</span>
            </div>

            {/* Profile Brief */}
            <div className="dashboard-mini-card profile-widget" onClick={() => navigate('/profile')}>
               <div className="card-header-tiny">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Account</span>
              </div>
              <p>Manage security settings and authentication methods.</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
