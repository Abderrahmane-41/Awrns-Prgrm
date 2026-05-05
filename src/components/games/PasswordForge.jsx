import React, { useState, useEffect } from 'react';

// A brute force mock calculator 
const getCrackingTime = (pass) => {
  if (pass.length === 0) return { label: 'Instantly', score: 0, color: '#ef4444' };
  
  let score = 0;
  if (pass.length > 8) score++;
  if (pass.length > 12) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^a-zA-Z0-9]/.test(pass)) score++;

  if (score < 2) return { label: 'Milliseconds', score: 0, color: '#ef4444' };
  if (score === 2) return { label: 'Minutes', score: 50, color: '#fb923c' };
  if (score === 3) return { label: 'Weeks', score: 80, color: '#fbbf24' };
  return { label: 'Centuries', score: 100, color: '#10b981' };
};

const PasswordForge = ({ data, onComplete }) => {
  const [password, setPassword] = useState('');
  const status = getCrackingTime(password);

  const handleSubmit = () => {
    if (status.score === 100) {
      onComplete(100, true);
    } else {
      // Force failure
      onComplete(status.score, false);
    }
  };

  return (
    <div className="quiz-card" style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: '24px' }}>Forge an Uncrackable Password</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
        Type a password. The terminal will simulate how fast an attacker could crack it. 
        You must forge a password that takes "Centuries" to crack to pass!
      </p>

      <input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Type your password here..."
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '24px',
          background: 'rgba(0,0,0,0.5)',
          border: `2px solid ${status.color}`,
          color: '#fff',
          borderRadius: '12px',
          textAlign: 'center',
          fontFamily: 'monospace'
        }}
      />

      <div style={{ marginTop: '24px', padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
        <h3>Estimated Cracking Time:</h3>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: status.color, marginTop: '12px' }}>
          {status.label}
        </div>
      </div>

      <button 
        className="quiz-next-btn" 
        style={{ width: '100%', padding: '16px', fontSize: '18px', marginTop: '32px' }}
        onClick={handleSubmit}
      >
        Submit Password
      </button>
    </div>
  );
};

export default PasswordForge;
