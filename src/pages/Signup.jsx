import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ShieldLogo } from '../components/Icons';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

// Returns 0-4 strength score for password
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthMeta = [
  { label: 'Too weak', color: '#f87171', width: '15%',  cls: 'strength-weak'   },
  { label: 'Weak',     color: '#f85b3d', width: '30%',  cls: 'strength-weak'   },
  { label: 'Fair',     color: '#fb923c', width: '55%',  cls: 'strength-fair'   },
  { label: 'Good',     color: '#fbbf24', width: '75%',  cls: 'strength-good'   },
  { label: 'Strong',   color: '#34d399', width: '100%', cls: 'strength-strong' },
];

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm,  setShowConfirm]    = useState(false);
  const [isLoading,    setIsLoading]      = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const strength = getPasswordStrength(formData.password);
  const strengthInfo = strengthMeta[strength];

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
    switch (fieldName) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required';
        else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter a valid email address';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error;
  };

  const validateForm = () => {
    const fields = ['fullName', 'email', 'password', 'confirmPassword'];
    const newErrors = {};
    fields.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) newErrors[f] = err;
    });
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await signup(formData.email, formData.password, formData.fullName);
    setIsLoading(false);

    if (result.success && result.confirmationRequired) {
      await Swal.fire({
        iconHtml: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#6337ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path><polyline points="3 7 12 13 21 7"></polyline></svg>',
        customClass: {
          icon: 'custom-swal-icon'
        },
        title: 'Check your email',
        text: 'We sent a confirmation link to ' + formData.email + '. Please verify your account before logging in.',
        background: '#0d0d1a',
        color: '#fff',
        confirmButtonColor: '#6337ff',
      });
      navigate('/login');
    } else if (result.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Account Provisioned',
        text: 'Accessing Dashboard...',
        showConfirmButton: false,
        background: '#0d0d1a',
        color: '#fff',
        iconColor: '#34d399',
      });
      navigate('/dashboard');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Sign Up Failed',
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
          <Link to="/login" className="auth-tab" id="login-tab-link">Log in</Link>
          <button className="auth-tab active" id="signup-tab">Sign up</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="signup-fullname">Full Name</label>
            <input
              id="signup-fullname"
              type="text"
              name="fullName"
              placeholder="Jane Doe"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={() => handleBlur('fullName')}
              className={touched.fullName && errors.fullName ? 'input-error' : ''}
              disabled={isLoading}
              autoComplete="name"
            />
            {touched.fullName && errors.fullName && (
              <span className="error-message">⚠ {errors.fullName}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
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

          {/* Password */}
          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                className={touched.password && errors.password ? 'input-error' : ''}
                disabled={isLoading}
                autoComplete="new-password"
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
            {/* Password strength indicator */}
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{ width: strengthInfo.width, background: strengthInfo.color }}
                  />
                </div>
                <span className={`strength-label ${strengthInfo.cls}`}>
                  {strengthInfo.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="signup-confirm"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                className={touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <span className="error-message">⚠ {errors.confirmPassword}</span>
            )}
          </div>

          <button
            id="signup-submit"
            type="submit"
            className={`auth-button${isLoading ? ' loading' : ''}`}
            disabled={isLoading}
            style={{ marginTop: '8px' }}
          >
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
