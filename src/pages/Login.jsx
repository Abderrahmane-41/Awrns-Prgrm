import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ShieldLogo } from '../components/Icons';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (fieldName, value) => {
    let error = '';
    if (fieldName === 'email') {
      if (!value.trim()) error = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter a valid email address';
    }
    if (fieldName === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
    }
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error;
  };

  const validateForm = () => {
    const emailErr = validateField('email', formData.email);
    const passErr = validateField('password', formData.password);
    setTouched({ email: true, password: true });
    return !emailErr && !passErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await login(formData.email, formData.password);
    setIsLoading(false);

    if (result.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Authentication Successful',
        text: 'Accessing Dashboard...',
        timer: 1800,
        showConfirmButton: false,
        background: '#0d0d1a',
        color: '#fff',
        iconColor: '#34d399',
      });
      navigate('/dashboard');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: result.message,
        background: '#0d0d1a',
        color: '#fff',
        confirmButtonColor: '#6337ff',
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo"><ShieldLogo size={40} /></div>
          <h1 className="auth-app-name">CyberShield Academy</h1>
          <p className="auth-app-tagline">Security awareness training platform</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className="auth-tab active" id="login-tab">Log in</button>
          <Link to="/signup" className="auth-tab" id="signup-tab-link">Sign up</Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className={touched.email && errors.email ? 'input-error' : ''}
              disabled={isLoading}
              autoComplete="email"
            />
            {touched.email && errors.email && (
              <span className="error-message">⚠ {errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                className={touched.password && errors.password ? 'input-error' : ''}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {touched.password && errors.password && (
              <span className="error-message">⚠ {errors.password}</span>
            )}
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button
            id="login-submit"
            type="submit"
            className={`auth-button${isLoading ? ' loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <button
          id="google-login-btn"
          className="social-btn"
          disabled={isLoading}
          type="button"
        >
          {/* Google SVG */}
          <svg className="google-icon-svg" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;