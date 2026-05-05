import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldLogo } from '../components/Icons';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabaseClient';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      Swal.fire({ icon: 'error', title: 'Oops', text: 'Please enter your email.' });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setIsLoading(false);

    if (error) {
      Swal.fire({ icon: 'error', title: 'Failed', text: error.message });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Check your email',
        text: 'We sent a password reset link to your email.',
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo"><ShieldLogo size={40} /></div>
          <h1 className="auth-app-name">CyberShield Academy</h1>
          <p className="auth-app-tagline">Reset your password</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          <button type="submit" className={`auth-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
