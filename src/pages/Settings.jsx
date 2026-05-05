import React, { useState } from 'react';
import '../styles/Platform.css';
import Swal from 'sweetalert2';

const Settings = () => {
  const [config, setConfig] = useState({
    emailAlerts: true,
    leaderboardPrivacy: false,
    compactView: false,
    twoFactorEnrolled: false
  });

  const toggleSetting = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApply = () => {
    Swal.fire({
      background: '#111',
      color: '#fff',
      icon: 'success',
      title: 'Configuration Cached',
      text: 'Global application preferences have been saved.',
      confirmButtonColor: '#6337ff'
    });
  };

  return (
    <div className="dashboard-fixed-container fade-in">
       <div className="ambient-glow glow-2" style={{left: 'auto', right: '-200px'}}></div>
       <div className="dashboard-content-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}>
          
          <div className="glass-form-card" style={{ maxWidth: '600px' }}>
            <div className="form-header">
              <h2>Environment Configuration</h2>
              <p>Customize your security experience and privacy thresholds.</p>
            </div>

            <div className="settings-list">
              
              {/* Privacy Setting */}
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Leaderboard Anonymity</h4>
                  <p>Mask your name as "Anonymous User" on public rankings.</p>
                </div>
                <div className={`modern-toggle ${config.leaderboardPrivacy ? 'active' : ''}`} onClick={() => toggleSetting('leaderboardPrivacy')}>
                  <div className="toggle-handle"></div>
                </div>
              </div>

              {/* Alerts Setting */}
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Threat Intelligence Alerts</h4>
                  <p>Receive email notifications for critical zero-day exploits.</p>
                </div>
                <div className={`modern-toggle ${config.emailAlerts ? 'active' : ''}`} onClick={() => toggleSetting('emailAlerts')}>
                  <div className="toggle-handle"></div>
                </div>
              </div>

              {/* View Setting */}
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Compact Command Center</h4>
                  <p>Reduce whitespace in the dashboard for smaller displays.</p>
                </div>
                <div className={`modern-toggle ${config.compactView ? 'active' : ''}`} onClick={() => toggleSetting('compactView')}>
                  <div className="toggle-handle"></div>
                </div>
              </div>

              {/* 2FA Placeholder */}
              <div className="setting-item highlight-item">
                <div className="setting-info">
                  <h4 style={{ color: '#fbbf24' }}>Multi-Factor Authentication (MFA)</h4>
                  <p>Add a second layer of defense to your CyberShield account.</p>
                </div>
                <button className="setup-btn" onClick={() => Swal.fire({ title: 'Integrate Authy/Google Authenticator', text: 'This feature is currently being provisioned for your organization.', background: '#111', color: '#fff' })}>
                  Set Up
                </button>
              </div>

            </div>

            <button className="form-submit-btn" onClick={handleApply} style={{ marginTop: '32px' }}>
              Apply Current Configuration
            </button>
          </div>

       </div>
    </div>
  );
};

export default Settings;
