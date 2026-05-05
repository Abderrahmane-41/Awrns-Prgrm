import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldLogo } from '../components/Icons';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabaseClient';
import '../styles/Auth.css';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase automatically handles the access token in the URL hash
    // We just need to check if we have a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        Swal.fire({ icon: 'error', title: 'Invalid Link', text: 'This reset link has expired or is invalid.' });
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      Swal.fire({ icon: 'error', title: 'Oops', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      Swal.fire({ icon: 'error', title: 'Failed', text: error.message });
    } else {
      Swal.fire({ icon: 'success', title: 'Success', text: 'Your password has been updated!' });
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo"><ShieldLogo size={40} /></div>
          <h1 className="auth-app-name">CyberShield Academy</h1>
          <p className="auth-app-tagline">Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              disabled={isLoading}
            />
          </div>
          <button type="submit" className={`auth-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
