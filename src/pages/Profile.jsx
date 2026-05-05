import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import '../styles/Platform.css';

const Profile = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = {};
      if (fullName) updates.data = { full_name: fullName };
      if (email !== user.email) updates.email = email;
      if (password) updates.password = password;

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      Swal.fire({
        background: '#111',
        color: '#fff',
        icon: 'success',
        title: 'Profile Synchronized',
        text: 'Your security credentials have been updated.',
        iconColor: '#10b981',
        confirmButtonColor: '#6337ff'
      });
      setPassword('');
    } catch (error) {
      Swal.fire({
        background: '#111',
        color: '#fff',
        icon: 'error',
        title: 'Update Failed',
        text: error.message,
        iconColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-fixed-container fade-in">
      <div className="ambient-glow glow-1"></div>
      <div className="dashboard-content-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}>
        
        <div className="glass-form-card">
          <div className="form-header">
            <div className="user-avatar-large">
              {fullName?.charAt(0) || email?.charAt(0)}
            </div>
            <h2>Identity Management</h2>
            <p>Update your personal identifiers and security credentials.</p>
          </div>

          <form onSubmit={handleUpdate} className="modern-form">
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input 
                  type="text" 
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>New Password (Leave blank to keep current)</label>
              <div className="input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="form-submit-btn" disabled={loading}>
              {loading ? 'Encrypting...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
